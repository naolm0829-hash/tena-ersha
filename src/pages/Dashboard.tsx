import { useState, useEffect, useRef, useCallback } from "react";
import { Activity, Scan, HeartPulse, ShoppingBag, AlertCircle, Crown, Clock, CheckCircle2, XCircle, Send, RefreshCw, Bug } from "lucide-react";
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
  const [payments, setPayments] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [channelStatus, setChannelStatus] = useState<string>("idle");
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});
  const [lastEvent, setLastEvent] = useState<{ table: string; type: string; at: Date } | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  const cancelledRef = useRef(false);
  const isInitialRef = useRef(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAll = useCallback(async (opts: { initial?: boolean; manual?: boolean } = {}) => {
    if (!user) return;
    if (opts.initial) setLoading(true);
    if (opts.manual) setRefreshing(true);
    setError(null);
    try {
      const [scanRes, animalRes, listingRes, payRes, subRes] = await Promise.all([
        supabase.from("ai_diagnoses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("animal_health_records").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("marketplace_listings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("payment_requests" as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("subscriptions" as any).select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      if (cancelledRef.current) return;
      if (scanRes.error) throw scanRes.error;
      if (animalRes.error) throw animalRes.error;
      if (listingRes.error) throw listingRes.error;
      setScans(scanRes.data || []);
      setAnimals(animalRes.data || []);
      setListings(listingRes.data || []);
      setPayments((payRes.data as any[]) || []);
      setSubscription(subRes.data || null);
      setLastUpdated(new Date());
      setReloadCount((c) => c + 1);
    } catch (e: any) {
      if (!cancelledRef.current) setError(e?.message || "Failed to load dashboard");
    } finally {
      if (!cancelledRef.current) {
        if (opts.initial) setLoading(false);
        if (opts.manual) setRefreshing(false);
        isInitialRef.current = false;
      }
    }
  }, [user]);

  // Debounced realtime trigger — never flips to skeleton.
  const scheduleReload = useCallback((table: string, type: string) => {
    setEventCounts((prev) => ({ ...prev, [table]: (prev[table] || 0) + 1 }));
    setLastEvent({ table, type, at: new Date() });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { fetchAll(); }, 600);
  }, [fetchAll]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    cancelledRef.current = false;
    isInitialRef.current = true;
    fetchAll({ initial: true });

    const tables = ["payment_requests", "subscriptions", "ai_diagnoses", "marketplace_listings", "animal_health_records"];
    let channel = supabase.channel(`dash-${user.id}`);
    tables.forEach((t) => {
      const filter = t === "subscriptions" || t === "payment_requests" ? `user_id=eq.${user.id}` : `user_id=eq.${user.id}`;
      channel = channel.on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: t, filter },
        (payload: any) => scheduleReload(t, payload?.eventType || "change")
      );
    });
    channel.subscribe((status) => setChannelStatus(status));

    return () => {
      cancelledRef.current = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [user, fetchAll, scheduleReload]);

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
        <button onClick={() => fetchAll({ initial: true })} className="px-5 py-2 bg-primary text-primary-foreground rounded-lg font-medium">
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

  const totalEvents = Object.values(eventCounts).reduce((a, b) => a + b, 0);

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

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {lang === "am" ? "የመጨረሻ ዝመና" : "Last updated"}:{" "}
          {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchAll({ manual: true })}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            {lang === "am" ? "አድስ" : "Refresh"}
          </button>
          <button
            onClick={() => setShowDebug((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted"
          >
            <Bug className="h-3.5 w-3.5" />
            {showDebug ? "Hide" : "Debug"}
          </button>
        </div>
      </div>

      {showDebug && (
        <div className="bg-muted/40 border border-border rounded-xl p-4 text-xs font-mono space-y-2">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>channel: <b className={channelStatus === "SUBSCRIBED" ? "text-success" : "text-accent-foreground"}>{channelStatus}</b></span>
            <span>reloads: <b>{reloadCount}</b></span>
            <span>total events: <b>{totalEvents}</b></span>
            <span>loading: <b>{String(loading)}</b></span>
            <span>refreshing: <b>{String(refreshing)}</b></span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
            {["payment_requests", "subscriptions", "ai_diagnoses", "marketplace_listings", "animal_health_records"].map((t) => (
              <div key={t} className="flex justify-between bg-background rounded px-2 py-1">
                <span>{t}</span>
                <b>{eventCounts[t] || 0}</b>
              </div>
            ))}
          </div>
          {lastEvent && (
            <p className="text-muted-foreground">
              last: {lastEvent.table} · {lastEvent.type} @ {lastEvent.at.toLocaleTimeString()}
            </p>
          )}
        </div>
      )}

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

      {/* Premium / Payment Timeline */}
      {(payments.length > 0 || subscription) && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="font-heading font-bold flex items-center gap-2">
            <Crown className="h-5 w-5 text-accent" />
            {lang === "am" ? "የክፍያ ሁኔታ" : "Premium Status"}
          </h2>

          {subscription?.status === "active" && (
            <div className="p-3 rounded-lg bg-success/10 border border-success/30 text-sm">
              <p className="font-semibold text-success">
                {lang === "am" ? "ንቁ" : "Active"} · {subscription.tier}
              </p>
              {subscription.expires_at && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {lang === "am" ? "ያበቃል" : "Expires"}: {new Date(subscription.expires_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {payments.length > 0 && (
            <ol className="relative border-l-2 border-border ml-2 space-y-4">
              {payments.map((p) => {
                const status = p.status as string;
                const Icon = status === "approved" ? CheckCircle2 : status === "rejected" ? XCircle : status === "pending" ? Clock : Send;
                const color = status === "approved" ? "text-success bg-success/10 border-success/30"
                  : status === "rejected" ? "text-destructive bg-destructive/10 border-destructive/30"
                  : "text-accent-foreground bg-accent/10 border-accent/30";
                return (
                  <li key={p.id} className="ml-4">
                    <span className={`absolute -left-[11px] flex items-center justify-center w-5 h-5 rounded-full border ${color}`}>
                      <Icon className="h-3 w-3" />
                    </span>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-sm font-medium capitalize">{status} · {p.tier}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.method?.toUpperCase()} · {p.amount} ETB
                          {p.reference ? ` · Ref: ${p.reference}` : ""}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleString()}
                      </span>
                    </div>
                    {status === "rejected" && (
                      <Link to="/premium" className="text-xs text-primary hover:underline">
                        {lang === "am" ? "እንደገና ይሞክሩ" : "Try again"} →
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;
