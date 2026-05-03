import { useEffect, useState } from "react";
import { BookOpen, Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/integrations/supabase/client";

interface Remedy {
  id: string;
  name: string;
  target: string;
  method: string;
  category: "plant" | "animal" | string;
}

const WisdomWiki = () => {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "plant" | "animal">("all");
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("wisdom_remedies" as any)
      .select("id, name, target, method, category")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setRemedies((data as unknown as Remedy[]) || []);
        setLoading(false);
      });
  }, []);

  const filtered = remedies.filter((r) => {
    const ms = r.name.toLowerCase().includes(search.toLowerCase()) || r.target.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "all" || r.category === filter;
    return ms && mf;
  });

  return (
    <div className="container py-8 max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-heading font-bold flex items-center justify-center gap-2">
          <BookOpen className="h-7 w-7 text-primary" />
          {t("wisdom.title")}
        </h1>
        <p className="text-muted-foreground">{t("wisdom.subtitle")}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t("wisdom.search")}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border" />
        </div>
        <div className="flex gap-2">
          {(["all", "plant", "animal"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}>
              {f === "all" ? t("wisdom.all") : f === "plant" ? `🌿 ${t("wisdom.plant")}` : `🐄 ${t("wisdom.animal")}`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.4) }}
              className="bg-card border border-border rounded-lg p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold">{r.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {r.category === "plant" ? `🌿 ${t("wisdom.plant")}` : `🐄 ${t("wisdom.animal")}`}
                </span>
              </div>
              <p className="text-sm font-medium text-accent">{r.target}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{r.method}</p>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">{t("wisdom.noResults")}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default WisdomWiki;
