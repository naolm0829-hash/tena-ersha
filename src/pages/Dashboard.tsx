import { useState, useEffect } from "react";
import { Activity, Scan, HeartPulse, ShoppingBag, AlertCircle, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/contexts/LangContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePremium } from "@/hooks/usePremium";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { lang } = useLang();
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const [scans, setScans] = useState<any[]>([]);
  const [animals, setAnimals] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [scanRes, animalRes, listingRes] = await Promise.all([
          supabase.from("ai_diagnoses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
          supabase.from("animal_health_records").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("marketplace_listings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
        ]);
        if (cancelled) return;
        if (scanRes.error) throw scanRes.error;
        if (animalRes.error) throw animalRes.error;
        if (listingRes.error) throw listingRes.error;
        setScans(scanRes.data || []);
        setAnimals(animalRes.data || []);
        setListings(listingRes.data || []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user]);

  if (!user) {
    return (
      <div className="container py-16 text-center space-y-4">
        <Activity className="h-12 w-12 mx-auto text-primary" />
        <h1 className="text-2xl font-heading font-bold">{lang === "am" ? "ዳሽቦርድ" : "Dashboard"}</h1>
        <p className="text-muted-foreground">{lang === "am" ? "ለመጠቀም ይግቡ" : "Log in to see your dashboard"}</p>
        <Link to="/auth" className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium">
          {lang === "am" ? "ግባ" : "Log In"}
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-8 space-y-6 max-w-4xl animate-pulse">
        <div className="h-9 w-56 mx-auto bg-muted rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 h-28" />
          ))}
        </div>
        <div className="bg-card border border-border rounded-xl p-5 h-48" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-16 max-w-md mx-auto text-center space-y-4">
        <AlertCircle className="h-10 w-10 mx-auto text-destructive" />
        <p className="text-muted-foreground">{error}</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2 bg-primary text-primary-foreground rounded-lg font-medium">
          {lang === "am" ? "እንደገና ሞክር" : "Try again"}
        </button>
      </div>
    );
  }

  const healthyCount = animals.filter(a => a.status === "healthy").length;
  const sickCount = animals.filter(a => a.status !== "healthy").length;

  const stats = [
    { icon: Scan, label: lang === "am" ? "AI ምርመራዎች" : "AI Scans", value: scans.length, color: "bg-primary/10 text-primary" },
    { icon: HeartPulse, label: lang === "am" ? "ጤናማ እንስሳት" : "Healthy Animals", value: healthyCount, color: "bg-success/10 text-success" },
    { icon: Activity, label: lang === "am" ? "የታመሙ" : "Sick Animals", value: sickCount, color: "bg-destructive/10 text-destructive" },
    { icon: ShoppingBag, label: lang === "am" ? "የገበያ ዝርዝሮች" : "My Listings", value: listings.length, color: "bg-accent/10 text-accent-foreground" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="container py-8 space-y-6 max-w-4xl"
    >
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-heading font-bold text-primary">
          📊 {lang === "am" ? "የእኔ ዳሽቦርድ" : "My Dashboard"}
        </h1>
        {isPremium ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-xs font-bold">
            <Crown className="h-3 w-3" /> PREMIUM
          </span>
        ) : (
          <Link to="/premium" className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-accent text-accent text-xs font-medium hover:bg-accent/10">
            <Crown className="h-3 w-3" /> Upgrade to Premium
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-card border border-border rounded-xl p-4 text-center space-y-2 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mx-auto`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent scans */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <h2 className="font-heading font-bold flex items-center gap-2">
          <Scan className="h-5 w-5 text-primary" />
          {lang === "am" ? "የቅርብ ጊዜ ምርመራዎች" : "Recent Scans"}
        </h2>
        {scans.length === 0 ? (
          <p className="text-sm text-muted-foreground">{lang === "am" ? "ገና ምርመራ የለም" : "No scans yet"}</p>
        ) : (
          <div className="space-y-2">
            {scans.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{s.diagnosis_name}</p>
                  <p className="text-xs text-muted-foreground">{s.scan_type} · {new Date(s.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-sm font-bold ${s.confidence > 0.7 ? "text-success" : s.confidence > 0.4 ? "text-accent-foreground" : "text-destructive"}`}>
                  {Math.round(s.confidence * 100)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Animal health overview */}
      {animals.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h2 className="font-heading font-bold flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-success" />
            {lang === "am" ? "የእንስሳ ጤና" : "Animal Health"}
          </h2>
          {/* Simple bar showing healthy vs sick */}
          <div className="flex rounded-full overflow-hidden h-4">
            {healthyCount > 0 && (
              <div
                className="bg-success flex items-center justify-center text-[10px] text-white font-bold"
                style={{ width: `${(healthyCount / animals.length) * 100}%` }}
              >
                {healthyCount}
              </div>
            )}
            {sickCount > 0 && (
              <div
                className="bg-destructive flex items-center justify-center text-[10px] text-white font-bold"
                style={{ width: `${(sickCount / animals.length) * 100}%` }}
              >
                {sickCount}
              </div>
            )}
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-success" /> {lang === "am" ? "ጤናማ" : "Healthy"}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-destructive" /> {lang === "am" ? "የታመመ" : "Sick"}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;
