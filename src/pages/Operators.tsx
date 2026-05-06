import { useEffect, useState } from "react";
import { Plus, MapPin, Phone, X, HardHat } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const skills=["tractor","combine","sprayer","irrigation","plowing","harvesting"];
interface Op { id:string; user_id:string; full_name:string; skills:string[]; experience_years:number; rate_per_day:number; location:string|null; contact:string|null; bio:string|null; available:boolean; }

export default function Operators(){
  const { user } = useAuth();
  const [items,setItems]=useState<Op[]>([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({full_name:"",skills:[] as string[],experience_years:"",rate_per_day:"",location:"",contact:"",bio:""});

  const load=async()=>{
    const { data } = await supabase.from("operator_listings").select("*").eq("available",true).order("created_at",{ascending:false});
    setItems((data as Op[])||[]); setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const toggleSkill=(s:string)=>setForm(f=>({...f,skills:f.skills.includes(s)?f.skills.filter(x=>x!==s):[...f.skills,s]}));

  const create=async()=>{
    if(!user||!form.full_name) return;
    const { error } = await supabase.from("operator_listings").insert({ user_id:user.id, full_name:form.full_name, skills:form.skills, experience_years:Number(form.experience_years)||0, rate_per_day:Number(form.rate_per_day)||0, location:form.location||null, contact:form.contact||null, bio:form.bio||null });
    if(error) return toast.error(error.message);
    toast.success("Listed"); setShowForm(false); setForm({full_name:"",skills:[],experience_years:"",rate_per_day:"",location:"",contact:"",bio:""}); load();
  };
  const del=async(id:string)=>{ await supabase.from("operator_listings").delete().eq("id",id); load(); };

  return (
    <div className="container py-8 space-y-6">
      <div className="text-center"><h1 className="text-3xl font-heading font-bold text-primary flex items-center justify-center gap-2"><HardHat/>Hire Operators</h1>
        <p className="text-muted-foreground text-sm">Find skilled tractor & combine operators near you</p></div>

      {user ? <button onClick={()=>setShowForm(!showForm)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl"><Plus className="h-5 w-5"/>Offer your services</button>
       : <Link to="/auth" className="block text-center text-sm text-primary underline">Login to list</Link>}

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <input value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} placeholder="Full name" className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
          <div className="flex flex-wrap gap-2">
            {skills.map(s=><button key={s} type="button" onClick={()=>toggleSkill(s)} className={`px-3 py-1 rounded-full text-xs ${form.skills.includes(s)?"bg-primary text-primary-foreground":"bg-muted"}`}>{s}</button>)}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={form.experience_years} onChange={e=>setForm({...form,experience_years:e.target.value})} placeholder="Years exp" className="border rounded-lg px-3 py-2 text-sm bg-background"/>
            <input type="number" value={form.rate_per_day} onChange={e=>setForm({...form,rate_per_day:e.target.value})} placeholder="Rate ETB/day" className="border rounded-lg px-3 py-2 text-sm bg-background"/>
          </div>
          <input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Location" className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
          <input value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} placeholder="Phone" className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
          <textarea value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} placeholder="About you" rows={2} className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
          <button onClick={create} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Post</button>
        </div>
      )}

      {loading ? <p className="text-center">Loading...</p> :
       items.length===0 ? <p className="text-center text-muted-foreground py-8">No operators yet.</p> :
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
         {items.map(o=>(
           <div key={o.id} className="bg-card border border-border rounded-xl p-4 space-y-2 relative">
             {user?.id===o.user_id && <button onClick={()=>del(o.id)} className="absolute top-2 right-2 p-1 rounded-full bg-destructive/10 text-destructive"><X className="h-4 w-4"/></button>}
             <h3 className="font-bold flex items-center gap-2"><HardHat className="h-4 w-4 text-primary"/>{o.full_name}</h3>
             <p className="text-xs text-muted-foreground">{o.experience_years} yrs experience</p>
             <div className="flex flex-wrap gap-1">{o.skills.map(s=><span key={s} className="px-2 py-0.5 rounded-full bg-muted text-xs">{s}</span>)}</div>
             <p className="font-bold text-primary">{o.rate_per_day} ETB/day</p>
             {o.bio && <p className="text-xs text-muted-foreground">{o.bio}</p>}
             {o.location && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3"/>{o.location}</p>}
             {o.contact && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3"/>{o.contact}</p>}
           </div>
         ))}
       </div>}
    </div>
  );
}
