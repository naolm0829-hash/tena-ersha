import { useState } from "react";
import { Calculator } from "lucide-react";

const recs = [
  { max: 2,    tool: "Hand tools / oxen plow", buy_price: 5000,    rent_per_day: 0 },
  { max: 5,    tool: "Walking tractor (power tiller)", buy_price: 80000, rent_per_day: 800 },
  { max: 15,   tool: "Compact tractor 25-40 HP", buy_price: 600000, rent_per_day: 1800 },
  { max: 50,   tool: "Mid tractor 50-75 HP", buy_price: 1500000, rent_per_day: 3000 },
  { max: 9999, tool: "Large tractor 90+ HP / combine", buy_price: 3500000, rent_per_day: 6000 },
];

export default function ToolCalculator() {
  const [acres,setAcres]=useState("");
  const [daysPerYear,setDays]=useState("30");

  const a=Number(acres)||0;
  const d=Number(daysPerYear)||0;
  const rec = a>0 ? recs.find(r=>a<=r.max) : null;
  const annualRent = rec ? rec.rent_per_day*d : 0;
  const breakeven = rec && rec.rent_per_day>0 ? Math.ceil(rec.buy_price / rec.rent_per_day) : null;
  const recommend = rec && breakeven ? (d > breakeven/5 ? "BUY" : "RENT") : null;

  return (
    <div className="container py-8 max-w-xl space-y-6">
      <div className="text-center"><h1 className="text-3xl font-heading font-bold text-primary flex items-center justify-center gap-2"><Calculator/>Tool Cost Calculator</h1>
        <p className="text-muted-foreground text-sm">Right-size your equipment and decide buy vs rent</p></div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <label className="block text-sm">Farm size (hectares / acres)
          <input type="number" value={acres} onChange={e=>setAcres(e.target.value)} placeholder="e.g. 10" className="w-full mt-1 border rounded-lg px-3 py-2 bg-background"/>
        </label>
        <label className="block text-sm">Days you'd use the tool per year
          <input type="number" value={daysPerYear} onChange={e=>setDays(e.target.value)} placeholder="e.g. 30" className="w-full mt-1 border rounded-lg px-3 py-2 bg-background"/>
        </label>
      </div>

      {rec && (
        <div className="bg-accent/10 border border-accent/40 rounded-xl p-5 space-y-3">
          <h2 className="font-bold text-lg">Recommended: {rec.tool}</h2>
          <p className="text-sm">Approx. buy price: <b>{rec.buy_price.toLocaleString()} ETB</b></p>
          {rec.rent_per_day>0 && (<>
            <p className="text-sm">Rent rate: <b>{rec.rent_per_day} ETB/day</b></p>
            <p className="text-sm">Estimated annual rent at {d} days: <b>{annualRent.toLocaleString()} ETB</b></p>
            {breakeven && <p className="text-sm">Break-even at <b>{breakeven} rent-days</b> total (≈ {Math.ceil(breakeven/5)} years if used {d}d/yr)</p>}
            <div className="text-xl font-bold text-primary">→ {recommend === "BUY" ? "Buying makes sense" : "Renting is cheaper for you"}</div>
          </>)}
        </div>
      )}
      {!rec && a===0 && <p className="text-center text-muted-foreground text-sm">Enter your farm size to get a recommendation.</p>}
    </div>
  );
}
