import { useEffect, useState } from "react";
import { Plus, QrCode, X, Wrench, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Tool { id:string; name:string; category:string; brand:string|null; model:string|null; serial_number:string|null; manual_url:string|null; notes:string|null; qr_code:string; }
interface Maint { id:string; tool_id:string; service_date:string; service_type:string; cost:number; fuel_liters:number|null; hours_used:number|null; notes:string|null; }

export default function MyTools() {
  const { user } = useAuth();
  const [tools,setTools]=useState<Tool[]>([]);
  const [maint,setMaint]=useState<Record<string,Maint[]>>({});
  const [showForm,setShowForm]=useState(false);
  const [openTool,setOpenTool]=useState<string|null>(null);
  const [form,setForm]=useState({name:"",category:"tractor",brand:"",model:"",serial_number:"",manual_url:"",notes:""});
  const [mForm,setMForm]=useState({service_date:new Date().toISOString().slice(0,10),service_type:"oil change",cost:"",fuel_liters:"",hours_used:"",notes:""});
  const [qrTool,setQrTool]=useState<Tool|null>(null);

  const load=async()=>{
    if(!user) return;
    const { data } = await supabase.from("owned_tools").select("*").eq("owner_id",user.id).order("created_at",{ascending:false});
    setTools((data as Tool[])||[]);
    const { data: m } = await supabase.from("tool_maintenance").select("*").eq("owner_id",user.id).order("service_date",{ascending:false});
    const grouped: Record<string,Maint[]> = {};
    (m||[]).forEach((row:any)=>{ (grouped[row.tool_id] ||= []).push(row); });
    setMaint(grouped);
  };
  useEffect(()=>{ load(); },[user]);

  if(!user) return <div className="container py-8 text-center"><Link to="/auth" className="text-primary underline">Login to manage your tools</Link></div>;

  const addTool=async()=>{
    if(!form.name) return;
    const { error } = await supabase.from("owned_tools").insert({ owner_id:user.id, ...form, brand:form.brand||null, model:form.model||null, serial_number:form.serial_number||null, manual_url:form.manual_url||null, notes:form.notes||null });
    if(error) return toast.error(error.message);
    toast.success("Tool added"); setShowForm(false); setForm({name:"",category:"tractor",brand:"",model:"",serial_number:"",manual_url:"",notes:""}); load();
  };
  const delTool=async(id:string)=>{ await supabase.from("owned_tools").delete().eq("id",id); load(); };
  const addMaint=async(toolId:string)=>{
    const { error } = await supabase.from("tool_maintenance").insert({ tool_id:toolId, owner_id:user.id, service_date:mForm.service_date, service_type:mForm.service_type, cost:Number(mForm.cost)||0, fuel_liters:mForm.fuel_liters?Number(mForm.fuel_liters):null, hours_used:mForm.hours_used?Number(mForm.hours_used):null, notes:mForm.notes||null });
    if(error) return toast.error(error.message);
    toast.success("Logged"); setMForm({service_date:new Date().toISOString().slice(0,10),service_type:"oil change",cost:"",fuel_liters:"",hours_used:"",notes:""}); load();
  };
  const delMaint=async(id:string)=>{ await supabase.from("tool_maintenance").delete().eq("id",id); load(); };

  const qrUrl=(code:string)=>`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(window.location.origin+"/tool/"+code)}`;

  return (
    <div className="container py-8 space-y-6 max-w-4xl">
      <div className="text-center"><h1 className="text-3xl font-heading font-bold text-primary">🔧 My Tools & Maintenance</h1>
        <p className="text-muted-foreground text-sm">Track every tool, log services, print QR tags</p></div>

      <button onClick={()=>setShowForm(!showForm)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl"><Plus className="h-5 w-5"/>Add Tool</button>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Tool name" className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})} placeholder="Brand" className="border rounded-lg px-3 py-2 text-sm bg-background"/>
            <input value={form.model} onChange={e=>setForm({...form,model:e.target.value})} placeholder="Model" className="border rounded-lg px-3 py-2 text-sm bg-background"/>
          </div>
          <input value={form.serial_number} onChange={e=>setForm({...form,serial_number:e.target.value})} placeholder="Serial number" className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
          <input value={form.manual_url} onChange={e=>setForm({...form,manual_url:e.target.value})} placeholder="Manual link (optional)" className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
          <button onClick={addTool} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Save</button>
        </div>
      )}

      <div className="space-y-3">
        {tools.length===0 ? <p className="text-center text-muted-foreground">No tools yet.</p> :
         tools.map(t=>(
           <div key={t.id} className="bg-card border border-border rounded-xl p-4">
             <div className="flex items-center justify-between">
               <div><h3 className="font-bold flex items-center gap-2"><Wrench className="h-4 w-4 text-primary"/>{t.name}</h3>
                 <p className="text-xs text-muted-foreground">{t.brand} {t.model} {t.serial_number && `· #${t.serial_number}`}</p></div>
               <div className="flex gap-1">
                 <button onClick={()=>setQrTool(t)} className="p-2 rounded bg-muted" title="QR tag"><QrCode className="h-4 w-4"/></button>
                 <button onClick={()=>setOpenTool(openTool===t.id?null:t.id)} className="px-3 py-1 rounded bg-accent text-accent-foreground text-xs">Log</button>
                 <button onClick={()=>delTool(t.id)} className="p-2 rounded bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4"/></button>
               </div>
             </div>
             {openTool===t.id && (
               <div className="mt-4 border-t pt-4 space-y-3">
                 <div className="grid grid-cols-2 gap-2">
                   <input type="date" value={mForm.service_date} onChange={e=>setMForm({...mForm,service_date:e.target.value})} className="border rounded px-2 py-1 text-sm bg-background"/>
                   <input value={mForm.service_type} onChange={e=>setMForm({...mForm,service_type:e.target.value})} placeholder="Service type" className="border rounded px-2 py-1 text-sm bg-background"/>
                   <input type="number" value={mForm.cost} onChange={e=>setMForm({...mForm,cost:e.target.value})} placeholder="Cost ETB" className="border rounded px-2 py-1 text-sm bg-background"/>
                   <input type="number" value={mForm.fuel_liters} onChange={e=>setMForm({...mForm,fuel_liters:e.target.value})} placeholder="Fuel L" className="border rounded px-2 py-1 text-sm bg-background"/>
                   <input type="number" value={mForm.hours_used} onChange={e=>setMForm({...mForm,hours_used:e.target.value})} placeholder="Hours" className="border rounded px-2 py-1 text-sm bg-background"/>
                   <button onClick={()=>addMaint(t.id)} className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm">Add log</button>
                 </div>
                 <ul className="space-y-1 text-xs">
                   {(maint[t.id]||[]).map(m=>(<li key={m.id} className="flex justify-between bg-muted/50 px-2 py-1 rounded">
                     <span>{m.service_date} · {m.service_type} · {m.cost} ETB {m.fuel_liters?`· ${m.fuel_liters}L`:""} {m.hours_used?`· ${m.hours_used}h`:""}</span>
                     <button onClick={()=>delMaint(m.id)} className="text-destructive">×</button>
                   </li>))}
                   {(maint[t.id]||[]).length===0 && <li className="text-muted-foreground">No service history yet.</li>}
                 </ul>
                 {(maint[t.id]||[]).length>0 && (
                   <p className="text-xs font-semibold">Total spent: {(maint[t.id]||[]).reduce((s,r)=>s+Number(r.cost),0).toFixed(0)} ETB</p>
                 )}
               </div>
             )}
           </div>
         ))}
      </div>

      {qrTool && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={()=>setQrTool(null)}>
          <div className="bg-card rounded-xl p-6 max-w-sm text-center space-y-3" onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setQrTool(null)} className="absolute"><X/></button>
            <h3 className="font-bold">{qrTool.name}</h3>
            <img src={qrUrl(qrTool.qr_code)} alt="QR" className="mx-auto"/>
            <p className="text-xs text-muted-foreground">Print and stick on the tool. Scan to view details.</p>
            <button onClick={()=>window.print()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Print</button>
          </div>
        </div>
      )}
    </div>
  );
}
