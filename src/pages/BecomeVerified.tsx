import { useEffect, useState } from "react";
import { Star, BadgeCheck, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function BecomeVerified(){
  const { user } = useAuth();
  const [status,setStatus]=useState<string|null>(null);
  const [notes,setNotes]=useState("");
  const [loading,setLoading]=useState(true);

  const load=async()=>{
    if(!user) return setLoading(false);
    const { data } = await supabase.from("seller_verifications").select("status,notes").eq("user_id",user.id).maybeSingle();
    setStatus(data?.status||null); setNotes(data?.notes||""); setLoading(false);
  };
  useEffect(()=>{ load(); },[user]);

  if(!user) return <div className="container py-8 text-center"><Link to="/auth" className="text-primary underline">Login to apply</Link></div>;
  if(loading) return <div className="container py-8 text-center">Loading...</div>;

  const apply=async()=>{
    const { error } = await supabase.from("seller_verifications").insert({ user_id:user.id, notes });
    if(error) return toast.error(error.message);
    toast.success("Application submitted"); load();
  };

  return (
    <div className="container py-8 max-w-lg space-y-6">
      <div className="text-center"><h1 className="text-3xl font-heading font-bold text-primary flex items-center justify-center gap-2"><Star/>Get Verified Seller Badge</h1>
        <p className="text-muted-foreground text-sm">Build buyer trust with an admin-verified badge</p></div>

      {status==="approved" ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center text-green-700">
          <BadgeCheck className="h-12 w-12 mx-auto mb-2"/>
          <h2 className="font-bold text-lg">You are verified!</h2>
          <p className="text-sm">A blue badge is now shown on all your listings.</p>
        </div>
      ) : status==="pending" ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center text-amber-700">
          <Clock className="h-12 w-12 mx-auto mb-2"/>
          <h2 className="font-bold text-lg">Under review</h2>
          <p className="text-sm">Admin will review shortly.</p>
        </div>
      ) : status==="rejected" ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">
          <h2 className="font-bold">Rejected</h2>
          <p className="text-sm">{notes||"Contact admin for details."}</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <p className="text-sm text-muted-foreground">Tell us about your farm/business — kebele, ID, references.</p>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={5} placeholder="My name is... I farm in... ID #..." className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
          <button onClick={apply} className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg">Apply</button>
        </div>
      )}
    </div>
  );
}
