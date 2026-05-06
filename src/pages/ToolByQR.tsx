import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Wrench, FileText } from "lucide-react";

export default function ToolByQR() {
  const { code } = useParams();
  const [tool,setTool]=useState<any>(null);
  const [maint,setMaint]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    (async()=>{
      const { data } = await supabase.from("owned_tools").select("*").eq("qr_code",code).maybeSingle();
      setTool(data);
      if(data){
        const { data: m } = await supabase.from("tool_maintenance").select("*").eq("tool_id",data.id).order("service_date",{ascending:false});
        setMaint(m||[]);
      }
      setLoading(false);
    })();
  },[code]);

  if(loading) return <div className="container py-8 text-center">Loading...</div>;
  if(!tool) return <div className="container py-8 text-center text-muted-foreground">Tool not found.</div>;

  return (
    <div className="container py-8 max-w-2xl space-y-6">
      <div className="bg-card border border-border rounded-xl p-6 space-y-2">
        <div className="flex items-center gap-2"><Wrench className="h-6 w-6 text-primary"/><h1 className="text-2xl font-bold">{tool.name}</h1></div>
        <p className="text-sm text-muted-foreground">{tool.brand} {tool.model}</p>
        {tool.serial_number && <p className="text-xs">Serial: {tool.serial_number}</p>}
        {tool.manual_url && <a href={tool.manual_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary underline"><FileText className="h-4 w-4"/>Open manual</a>}
        {tool.notes && <p className="text-sm">{tool.notes}</p>}
      </div>
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-bold mb-3">Service History</h2>
        {maint.length===0 ? <p className="text-sm text-muted-foreground">No services logged yet.</p> :
         <ul className="space-y-2 text-sm">
           {maint.map(m=><li key={m.id} className="flex justify-between border-b border-border/50 pb-2">
             <span><b>{m.service_date}</b> · {m.service_type}</span>
             <span className="text-muted-foreground">{m.cost} ETB</span></li>)}
         </ul>}
      </div>
    </div>
  );
}
