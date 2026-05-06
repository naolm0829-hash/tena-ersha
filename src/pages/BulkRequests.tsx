import { useEffect, useState } from "react";
import { Plus, Phone, X, Package, MapPin, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Req { id:string; buyer_id:string; crop:string; quantity_quintals:number; max_price_per_quintal:number|null; region:string|null; needed_by:string|null; contact:string|null; notes:string|null; status:string; }

export default function BulkRequests(){
  const { user } = useAuth();
  const [items,setItems]=useState<Req[]>([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({crop:"",quantity_quintals:"",max_price_per_quintal:"",region:"",needed_by:"",contact:"",notes:""});

  const load=async()=>{ const { data } = await supabase.from("bulk_requests").select("*").eq("status","open").order("created_at",{ascending:false}); setItems((data as Req[])||[]); setLoading(false); };
  useEffect(()=>{ load(); },[]);

  const create=async()=>{
    if(!user||!form.crop||!form.quantity_quintals) return;
    const { error } = await supabase.from("bulk_requests").insert({ buyer_id:user.id, crop:form.crop, quantity_quintals:Number(form.quantity_quintals), max_price_per_quintal:form.max_price_per_quintal?Number(form.max_price_per_quintal):null, region:form.region||null, needed_by:form.needed_by||null, contact:form.contact||null, notes:form.notes||null });
    if(error) return toast.error(error.message);
    toast.success("Posted"); setShowForm(false); setForm({crop:"",quantity_quintals:"",max_price_per_quintal:"",region:"",needed_by:"",contact:"",notes:""}); load();
  };
  const close=async(id:string)=>{ await supabase.from("bulk_requests").update({status:"closed"}).eq("id",id); load(); };

  return (
    <div className="container py-8 space-y-6">
      <div className="text-center"><h1 className="text-3xl font-heading font-bold text-primary flex items-center justify-center gap-2"><Package/>Bulk Buyer Requests</h1>
        <p className="text-muted-foreground text-sm">Buyers post what they need — farmers respond directly</p></div>

      {user ? <button onClick={()=>setShowForm(!showForm)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl"><Plus className="h-5 w-5"/>Post a request</button>
       : <Link to="/auth" className="block text-center text-sm text-primary underline">Login to post</Link>}

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <input value={form.crop} onChange={e=>setForm({...form,crop:e.target.value})} placeholder="Crop (e.g. teff, maize)" className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={form.quantity_quintals} onChange={e=>setForm({...form,quantity_quintals:e.target.value})} placeholder="Quintals needed" className="border rounded-lg px-3 py-2 text-sm bg-background"/>
            <input type="number" value={form.max_price_per_quintal} onChange={e=>setForm({...form,max_price_per_quintal:e.target.value})} placeholder="Max ETB/quintal" className="border rounded-lg px-3 py-2 text-sm bg-background"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.region} onChange={e=>setForm({...form,region:e.target.value})} placeholder="Region" className="border rounded-lg px-3 py-2 text-sm bg-background"/>
            <input type="date" value={form.needed_by} onChange={e=>setForm({...form,needed_by:e.target.value})} className="border rounded-lg px-3 py-2 text-sm bg-background"/>
          </div>
          <input value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} placeholder="Phone" className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
          <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Notes" rows={2} className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
          <button onClick={create} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Post</button>
        </div>
      )}

      {loading ? <p className="text-center">Loading...</p> :
       items.length===0 ? <p className="text-center text-muted-foreground py-8">No open requests.</p> :
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
         {items.map(r=>(
           <div key={r.id} className="bg-card border border-border rounded-xl p-4 space-y-2 relative">
             {user?.id===r.buyer_id && <button onClick={()=>close(r.id)} className="absolute top-2 right-2 p-1 rounded-full bg-destructive/10 text-destructive" title="Close"><X className="h-4 w-4"/></button>}
             <h3 className="font-bold capitalize">{r.crop}</h3>
             <p className="text-2xl font-bold text-primary">{r.quantity_quintals} quintals</p>
             {r.max_price_per_quintal && <p className="text-sm">Up to <b>{r.max_price_per_quintal} ETB</b>/quintal</p>}
             {r.region && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3"/>{r.region}</p>}
             {r.needed_by && <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3"/>by {r.needed_by}</p>}
             {r.notes && <p className="text-xs">{r.notes}</p>}
             {r.contact && <a href={`tel:${r.contact}`} className="inline-flex items-center gap-1 text-sm text-primary font-semibold"><Phone className="h-4 w-4"/>{r.contact}</a>}
           </div>
         ))}
       </div>}
    </div>
  );
}
