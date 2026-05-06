import { useEffect, useState } from "react";
import { LineChart as LineIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Row { recorded_at:string; price_per_quintal:number; crop_name:string; region:string; }

export default function PriceTrends(){
  const [rows,setRows]=useState<Row[]>([]);
  const [crop,setCrop]=useState("");
  const [region,setRegion]=useState("");
  const [crops,setCrops]=useState<string[]>([]);
  const [regions,setRegions]=useState<string[]>([]);

  useEffect(()=>{(async()=>{
    const { data } = await supabase.from("crop_prices").select("recorded_at,price_per_quintal,crop_name,region").gte("recorded_at",new Date(Date.now()-90*864e5).toISOString().slice(0,10)).order("recorded_at",{ascending:true});
    const list = (data as Row[])||[];
    setRows(list);
    const cs=Array.from(new Set(list.map(r=>r.crop_name))).sort();
    const rs=Array.from(new Set(list.map(r=>r.region))).sort();
    setCrops(cs); setRegions(rs);
    if(cs[0]) setCrop(cs[0]);
    if(rs[0]) setRegion(rs[0]);
  })();},[]);

  const filtered = rows.filter(r=>(!crop||r.crop_name===crop)&&(!region||r.region===region));
  const chartData = filtered.map(r=>({ date:r.recorded_at, price:Number(r.price_per_quintal) }));
  const avg = chartData.length ? chartData.reduce((s,r)=>s+r.price,0)/chartData.length : 0;
  const min = chartData.length ? Math.min(...chartData.map(r=>r.price)) : 0;
  const max = chartData.length ? Math.max(...chartData.map(r=>r.price)) : 0;
  const trend = chartData.length>=2 ? chartData[chartData.length-1].price - chartData[0].price : 0;

  return (
    <div className="container py-8 max-w-3xl space-y-6">
      <div className="text-center"><h1 className="text-3xl font-heading font-bold text-primary flex items-center justify-center gap-2"><LineIcon/>Price Trends</h1>
        <p className="text-muted-foreground text-sm">90-day market price history per crop & region</p></div>

      <div className="grid grid-cols-2 gap-3">
        <select value={crop} onChange={e=>setCrop(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-background">
          {crops.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select value={region} onChange={e=>setRegion(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-background">
          {regions.map(r=><option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {chartData.length===0 ? <p className="text-center text-muted-foreground py-8">No price data for this selection.</p> :
       <>
         <div className="grid grid-cols-4 gap-2 text-center">
           <div className="bg-card border rounded-lg p-3"><p className="text-xs text-muted-foreground">Avg</p><p className="font-bold">{avg.toFixed(0)}</p></div>
           <div className="bg-card border rounded-lg p-3"><p className="text-xs text-muted-foreground">Min</p><p className="font-bold">{min}</p></div>
           <div className="bg-card border rounded-lg p-3"><p className="text-xs text-muted-foreground">Max</p><p className="font-bold">{max}</p></div>
           <div className="bg-card border rounded-lg p-3"><p className="text-xs text-muted-foreground">Trend</p><p className={`font-bold ${trend>=0?"text-green-600":"text-red-600"}`}>{trend>=0?"↑":"↓"}{Math.abs(trend).toFixed(0)}</p></div>
         </div>
         <div className="bg-card border border-border rounded-xl p-4 h-72">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={chartData}>
               <CartesianGrid strokeDasharray="3 3" opacity={0.3}/>
               <XAxis dataKey="date" tick={{fontSize:10}}/>
               <YAxis tick={{fontSize:10}}/>
               <Tooltip/>
               <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false}/>
             </LineChart>
           </ResponsiveContainer>
         </div>
       </>}
    </div>
  );
}
