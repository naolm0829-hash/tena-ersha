import { useEffect, useState } from "react";
import { Plus, BellRing, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Saved { id:string; label:string; category:string|null; region:string|null; max_price:number|null; keywords:string|null; }

export default function SavedSearches(){
  const { user } = useAuth();
  const [items,setItems]=useState<Saved[]>([]);
  const [matches,setMatches]=useState<Record<string,number>>({});
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({label:"",category:"",region:"",max_price:"",keywords:""});

  const load=async()=>{
    if(!user) return;
    const { data } = await supabase.from("saved_searches").select("*").eq("user_id",user.id).order("created_at",{ascending:false});
    const list = (data as Saved[])||[];
    setItems(list);
    const counts: Record<string,number> = {};
    for(const s of list){
      let q = supabase.from("marketplace_listings").select("id",{count:"exact",head:true}).eq("status","active");
      if(s.category) q=q.eq("category",s.category);
      if(s.region) q=q.ilike("location",`%${s.region}%`);
      if(s.max_price) q=q.lte("price",s.max_price);
      if(s.keywords) q=q.ilike("title",`%${s.keywords}%`);
      const { count } = await q;
      counts[s.id]=count||0;
    }
    setMatches(counts);
  };
  useEffect(()=>{ load(); },[user]);

  if(!user) return <div className="container py-8 text-center"><Link to="/auth" className="text-primary underline">Login to save searches</Link></div>;

  const create=async()=>{
    if(!form.label) return;
    const { error } = await supabase.from("saved_searches").insert({ user_id:user.id, label:form.label, category:form.category||null, region:form.region||null, max_price:form.max_price?Number(form.max_price):null, keywords:form.keywords||null });
    if(error) return toast.error(error.message);
    toast.success("Saved"); setShowForm(false); setForm({label:"",category:"",region:"",max_price:"",keywords:""}); load();
  };
  const del=async(id:string)=>{ await supabase.from("saved_searches").delete().eq("id",id); load(); };

  return (
    <div className="container py-8 max-w-2xl space-y-6">
      <div className="text-center"><h1 className="text-3xl font-heading font-bold text-primary flex items-center justify-center gap-2"><BellRing/>Saved Searches</h1>
        <p className="text-muted-foreground text-sm">Get notified when new listings match what you're looking for</p></div>

      <button onClick={()=>setShowForm(!showForm)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl"><Plus className="h-5 w-5"/>New saved search</button>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <input value={form.label} onChange={e=>setForm({...form,label:e.target.value})} placeholder="Label (e.g. Cheap teff)" className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
          <input value={form.keywords} onChange={e=>setForm({...form,keywords:e.target.value})} placeholder="Keyword (e.g. teff)" className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="border rounded-lg px-3 py-2 text-sm bg-background">
              <option value="">Any category</option>
              <option value="crops">Crops</option><option value="livestock">Livestock</option>
              <option value="seeds">Seeds</option><option value="tools">Tools</option>
              <option value="feed">Feed</option><option value="other">Other</option>
            </select>
            <input value={form.region} onChange={e=>setForm({...form,region:e.target.value})} placeholder="Region/location" className="border rounded-lg px-3 py-2 text-sm bg-background"/>
          </div>
          <input type="number" value={form.max_price} onChange={e=>setForm({...form,max_price:e.target.value})} placeholder="Max price ETB" className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
          <button onClick={create} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Save</button>
        </div>
      )}

      <div className="space-y-2">
        {items.length===0 ? <p className="text-center text-muted-foreground">No saved searches.</p> :
         items.map(s=>(
           <Link to="/marketplace" key={s.id} className="flex items-center justify-between bg-card border border-border rounded-xl p-4 hover:border-primary">
             <div>
               <h3 className="font-bold">{s.label}</h3>
               <p className="text-xs text-muted-foreground">{[s.category,s.region,s.max_price?`≤${s.max_price} ETB`:null,s.keywords].filter(Boolean).join(" · ")||"Any listing"}</p>
             </div>
             <div className="flex items-center gap-2">
               <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold">{matches[s.id]??"…"} matches</span>
               <button onClick={(e)=>{e.preventDefault();del(s.id);}} className="p-2 text-destructive"><Trash2 className="h-4 w-4"/></button>
             </div>
           </Link>
         ))}
      </div>
    </div>
  );
}
