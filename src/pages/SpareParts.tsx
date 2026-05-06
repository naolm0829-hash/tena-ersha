import { useEffect, useState } from "react";
import { Plus, MapPin, Phone, X, Cog, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import ImageUpload from "@/components/ImageUpload";

const cats=["filter","blade","belt","tire","engine","hydraulic","other"];
interface Part { id:string; seller_id:string; name:string; fits:string|null; category:string; price:number; location:string|null; contact:string|null; image_url:string|null; in_stock:boolean; }

export default function SpareParts(){
  const { user } = useAuth();
  const [items,setItems]=useState<Part[]>([]);
  const [q,setQ]=useState("");
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({name:"",fits:"",category:"filter",price:"",location:"",contact:"",image_url:""});

  const load=async()=>{
    const { data } = await supabase.from("spare_parts").select("*").order("created_at",{ascending:false});
    setItems((data as Part[])||[]); setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const create=async()=>{
    if(!user||!form.name) return;
    const { error } = await supabase.from("spare_parts").insert({ seller_id:user.id, name:form.name, fits:form.fits||null, category:form.category, price:Number(form.price)||0, location:form.location||null, contact:form.contact||null, image_url:form.image_url||null });
    if(error) return toast.error(error.message);
    toast.success("Listed"); setShowForm(false); setForm({name:"",fits:"",category:"filter",price:"",location:"",contact:"",image_url:""}); load();
  };
  const del=async(id:string)=>{ await supabase.from("spare_parts").delete().eq("id",id); load(); };

  const filtered = items.filter(i=>!q || i.name.toLowerCase().includes(q.toLowerCase()) || (i.fits||"").toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="container py-8 space-y-6">
      <div className="text-center"><h1 className="text-3xl font-heading font-bold text-primary">⚙ Spare Parts Finder</h1>
        <p className="text-muted-foreground text-sm">Find parts that fit your tractor, sprayer or pump</p></div>
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by part or fits (e.g. John Deere 5050)" className="w-full pl-9 pr-3 py-2 border rounded-lg bg-background text-sm"/>
      </div>

      {user ? <button onClick={()=>setShowForm(!showForm)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl"><Plus className="h-5 w-5"/>Sell a part</button>
       : <Link to="/auth" className="block text-center text-sm text-primary underline">Login to sell</Link>}

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Part name" className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
          <input value={form.fits} onChange={e=>setForm({...form,fits:e.target.value})} placeholder="Fits (e.g. John Deere 5050D, MF 385)" className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
          <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-background">{cats.map(c=><option key={c} value={c}>{c}</option>)}</select>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="Price ETB" className="border rounded-lg px-3 py-2 text-sm bg-background"/>
            <input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Location" className="border rounded-lg px-3 py-2 text-sm bg-background"/>
          </div>
          <input value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} placeholder="Phone" className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
          <ImageUpload folder="parts" onUpload={url=>setForm({...form,image_url:url})}/>
          <button onClick={create} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Post</button>
        </div>
      )}

      {loading ? <p className="text-center">Loading...</p> :
       filtered.length===0 ? <p className="text-center text-muted-foreground py-8">No parts found.</p> :
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
         {filtered.map(p=>(
           <div key={p.id} className="bg-card border border-border rounded-xl p-4 space-y-2 relative">
             {user?.id===p.seller_id && <button onClick={()=>del(p.id)} className="absolute top-2 right-2 p-1 rounded-full bg-destructive/10 text-destructive"><X className="h-4 w-4"/></button>}
             {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-32 object-cover rounded"/>}
             <div className="flex items-center gap-1 text-xs text-primary"><Cog className="h-3 w-3"/>{p.category}</div>
             <h3 className="font-bold">{p.name}</h3>
             {p.fits && <p className="text-xs text-muted-foreground">Fits: {p.fits}</p>}
             <p className="font-bold text-primary">{p.price} ETB</p>
             {p.location && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3"/>{p.location}</p>}
             {p.contact && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3"/>{p.contact}</p>}
           </div>
         ))}
       </div>}
    </div>
  );
}
