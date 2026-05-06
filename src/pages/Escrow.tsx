import { useEffect, useState } from "react";
import { Wallet, Plus, CheckCircle, Clock, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Tx { id:string; listing_id:string|null; buyer_id:string; seller_id:string; amount:number; telebirr_reference:string|null; status:string; buyer_confirmed:boolean; seller_confirmed:boolean; created_at:string; released_at:string|null; }

const TELEBIRR_PHONE="0911223344";

export default function Escrow(){
  const { user } = useAuth();
  const [items,setItems]=useState<Tx[]>([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({seller_id:"",amount:"",telebirr_reference:"",listing_id:""});

  const load=async()=>{
    if(!user) return;
    const { data } = await supabase.from("escrow_transactions").select("*").or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`).order("created_at",{ascending:false});
    setItems((data as Tx[])||[]); setLoading(false);
  };
  useEffect(()=>{ load(); },[user]);

  if(!user) return <div className="container py-8 text-center"><Link to="/auth" className="text-primary underline">Login to use escrow</Link></div>;

  const create=async()=>{
    if(!form.seller_id||!form.amount||!form.telebirr_reference) return toast.error("Fill all fields");
    const { error } = await supabase.from("escrow_transactions").insert({ buyer_id:user.id, seller_id:form.seller_id, amount:Number(form.amount), telebirr_reference:form.telebirr_reference, listing_id:form.listing_id||null });
    if(error) return toast.error(error.message);
    toast.success("Escrow created"); setShowForm(false); setForm({seller_id:"",amount:"",telebirr_reference:"",listing_id:""}); load();
  };

  const confirm=async(tx:Tx,role:"buyer"|"seller")=>{
    const upd:any = role==="buyer" ? { buyer_confirmed:true } : { seller_confirmed:true };
    const both = (role==="buyer" ? true : tx.buyer_confirmed) && (role==="seller" ? true : tx.seller_confirmed);
    if(both){ upd.status="released"; upd.released_at=new Date().toISOString(); }
    await supabase.from("escrow_transactions").update(upd).eq("id",tx.id);
    load();
  };

  return (
    <div className="container py-8 max-w-2xl space-y-6">
      <div className="text-center"><h1 className="text-3xl font-heading font-bold text-primary flex items-center justify-center gap-2"><Wallet/>Telebirr Escrow</h1>
        <p className="text-muted-foreground text-sm">Pay safely. Funds held until both parties confirm delivery.</p></div>

      <button onClick={()=>setShowForm(!showForm)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl"><Plus className="h-5 w-5"/>Open new escrow</button>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="bg-accent/10 border border-accent/30 rounded p-3 text-xs">
            <p className="font-semibold">Step 1 — Send Telebirr to:</p>
            <p className="text-lg font-bold">{TELEBIRR_PHONE}</p>
            <p>Then paste the transaction reference below.</p>
          </div>
          <input value={form.seller_id} onChange={e=>setForm({...form,seller_id:e.target.value})} placeholder="Seller user ID" className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
          <input value={form.listing_id} onChange={e=>setForm({...form,listing_id:e.target.value})} placeholder="Listing ID (optional)" className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
          <input type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="Amount ETB" className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
          <input value={form.telebirr_reference} onChange={e=>setForm({...form,telebirr_reference:e.target.value})} placeholder="Telebirr txn reference" className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
          <button onClick={create} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Create</button>
        </div>
      )}

      {loading ? <p className="text-center">Loading...</p> :
       items.length===0 ? <p className="text-center text-muted-foreground py-8">No escrow transactions yet.</p> :
       <div className="space-y-3">
         {items.map(tx=>{
           const isBuyer = tx.buyer_id===user.id;
           const released = tx.status==="released";
           return (
             <div key={tx.id} className="bg-card border border-border rounded-xl p-4 space-y-2">
               <div className="flex justify-between items-start">
                 <div>
                   <p className="text-xs text-muted-foreground">{isBuyer?"You bought":"You sold"}</p>
                   <p className="text-2xl font-bold text-primary">{tx.amount} ETB</p>
                   <p className="text-xs">Ref: {tx.telebirr_reference}</p>
                 </div>
                 <span className={`px-3 py-1 rounded-full text-xs font-semibold ${released?"bg-green-100 text-green-700":"bg-amber-100 text-amber-700"}`}>{released?<><CheckCircle className="inline h-3 w-3"/> released</>:<><Clock className="inline h-3 w-3"/> {tx.status}</>}</span>
               </div>
               <div className="flex gap-2 text-xs">
                 <span className={tx.buyer_confirmed?"text-green-600":"text-muted-foreground"}>{tx.buyer_confirmed?"✓":"○"} Buyer confirmed</span>
                 <span className={tx.seller_confirmed?"text-green-600":"text-muted-foreground"}>{tx.seller_confirmed?"✓":"○"} Seller confirmed</span>
               </div>
               {!released && (
                 <button onClick={()=>confirm(tx,isBuyer?"buyer":"seller")} disabled={isBuyer?tx.buyer_confirmed:tx.seller_confirmed} className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm disabled:opacity-50">
                   Confirm {isBuyer?"received":"delivered"}
                 </button>
               )}
             </div>
           );
         })}
       </div>}
    </div>
  );
}
