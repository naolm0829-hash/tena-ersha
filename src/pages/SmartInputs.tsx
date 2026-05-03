import { useEffect, useState } from "react";
import { Sprout, Search, Loader2, RefreshCw, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const regions = ["Oromia", "Amhara", "Tigray", "SNNPR", "Sidama", "Afar", "Somali", "Harari", "Gambela", "Benishangul-Gumuz"];

interface Recs {
  seeds: string[];
  fertilizers: string[];
  feed: string[];
  seasonal_tip: string;
}

const SmartInputs = () => {
  const { t, lang } = useLang();
  const [region, setRegion] = useState("");
  const [data, setData] = useState<Recs | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string>("");

  const fetchRecs = async (r: string) => {
    if (!r) return;
    setLoading(true);
    setData(null);
    try {
      const { data: res, error } = await supabase.functions.invoke("smart-inputs", {
        body: { region: r, lang },
      });
      if (error) throw error;
      if (res?.error) throw new Error(res.error);
      setData(res?.data ?? null);
      setGeneratedAt(res?.generated_at ?? new Date().toISOString());
    } catch (e: any) {
      toast({ title: "Couldn't load recommendations", description: e?.message || "Try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (region) fetchRecs(region); }, [region, lang]);

  return (
    <div className="container py-8 max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-heading font-bold flex items-center justify-center gap-2">
          <Sprout className="h-7 w-7 text-accent" />
          {t("inputs.title")}
        </h1>
        <p className="text-muted-foreground">{t("inputs.subtitle")}</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <select value={region} onChange={(e) => setRegion(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border font-medium appearance-none">
          <option value="">{t("inputs.select")}</option>
          {regions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {region && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{generatedAt && `Updated ${new Date(generatedAt).toLocaleTimeString()}`}</span>
          <button onClick={() => fetchRecs(region)} className="flex items-center gap-1 hover:text-foreground">
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      )}

      {data && !loading && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {data.seasonal_tip && (
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 flex gap-3">
              <Lightbulb className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <p className="text-sm">{data.seasonal_tip}</p>
            </div>
          )}
          {[
            { title: `🌱 ${t("inputs.seeds")}`, items: data.seeds },
            { title: `🧪 ${t("inputs.fertilizers")}`, items: data.fertilizers },
            { title: `🐄 ${t("inputs.feed")}`, items: data.feed },
          ].map((cat) => (
            <div key={cat.title} className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2">{cat.title}</h3>
              <ul className="space-y-1">
                {(cat.items || []).map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default SmartInputs;
