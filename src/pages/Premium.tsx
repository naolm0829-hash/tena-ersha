import { useEffect, useState } from "react";
import { Crown, Check, Phone, Smartphone, Loader2, ShieldCheck, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePremium } from "@/hooks/usePremium";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const featureKeys = ["pf.1", "pf.2", "pf.3", "pf.4", "pf.5", "pf.6"] as const;
const telebirrPhone = "0930164845";

type Tier = "monthly" | "yearly";
const PRICES: Record<Tier, number> = { monthly: 150, yearly: 1500 };

const Premium = () => {
  const { t } = useLang();
  const { user } = useAuth();
  const { isPremium, loading: premLoading } = usePremium();
  const navigate = useNavigate();
  const [tier, setTier] = useState<Tier>("monthly");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingReq, setPendingReq] = useState<any>(null);

  const amount = PRICES[tier];

  useEffect(() => {
    if (!user) return;
    supabase.from("payment_requests" as any)
      .select("*").eq("user_id", user.id).eq("status", "pending")
      .order("created_at", { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => setPendingReq(data));
  }, [user]);

  const openTelebirr = () => {
    const ussd = `tel:*127*1*1*${telebirrPhone}*${amount}%23`;
    window.location.href = `telebirr://send?phone=${telebirrPhone}&amount=${amount}`;
    setTimeout(() => { window.location.href = ussd; }, 1200);
  };

  const submitRequest = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!reference.trim()) {
      toast({ title: "Reference required", description: "Enter the Telebirr transaction ID after paying.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.from("payment_requests" as any).insert({
      user_id: user.id, tier, amount, method: "telebirr", reference: reference.trim(), phone: telebirrPhone, status: "pending",
    } as any).select().single();
    setSubmitting(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setPendingReq(data);
    setReference("");
    toast({ title: "Submitted", description: "Admin will activate your premium soon." });
  };

  if (premLoading) {
    return <div className="container py-16 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;
  }

  if (isPremium) {
    return (
      <div className="container py-16 max-w-md mx-auto text-center space-y-4">
        <ShieldCheck className="h-16 w-16 mx-auto text-success" />
        <h1 className="text-2xl font-heading font-bold">You're Premium</h1>
        <p className="text-muted-foreground">All premium features are unlocked on this account.</p>
        <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-lg mx-auto space-y-8">
      <div className="text-center space-y-2">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Crown className="h-12 w-12 text-accent mx-auto" />
        </motion.div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold">{t("premium.title")}</h1>
        <p className="text-muted-foreground">{t("premium.subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(["monthly", "yearly"] as Tier[]).map((tt) => (
          <button key={tt} onClick={() => setTier(tt)}
            className={`p-4 rounded-xl border-2 transition ${tier === tt ? "border-accent bg-accent/10" : "border-border bg-card"}`}>
            <p className="text-sm uppercase tracking-wider text-muted-foreground">{tt}</p>
            <p className="text-2xl font-heading font-bold">{PRICES[tt]} ETB</p>
            {tt === "yearly" && <p className="text-xs text-success">Save 17%</p>}
          </button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border-2 border-accent rounded-xl p-6 space-y-5">
        <ul className="space-y-3">
          {featureKeys.map((key) => (
            <li key={key} className="flex items-start gap-3 text-sm">
              <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>

        <div className="border-t border-border pt-5 space-y-4">
          <h3 className="font-heading font-semibold text-center flex items-center justify-center gap-2">
            <Phone className="h-5 w-5" />
            {t("premium.payWith")}
          </h3>
          <div className="bg-muted rounded-lg p-4 text-center space-y-1">
            <p className="text-sm">{t("premium.transfer")} <span className="font-bold">{amount} ETB</span> {t("premium.to")}:</p>
            <p className="text-2xl font-heading font-bold tracking-wider">{telebirrPhone}</p>
            <p className="text-xs text-muted-foreground">{t("premium.account")}: Naol Mesfin (ናኦል መስፍን)</p>
          </div>
          <Button onClick={openTelebirr} className="w-full gap-2">
            <Smartphone className="h-4 w-4" /> Open Telebirr
          </Button>

          {pendingReq ? (
            <div className="bg-muted/60 border border-border rounded-lg p-4 text-center space-y-2">
              <Clock className="h-6 w-6 text-accent mx-auto" />
              <p className="text-sm font-medium">Payment under review</p>
              <p className="text-xs text-muted-foreground">Reference: {pendingReq.reference}</p>
              <p className="text-xs text-muted-foreground">Admin will activate your premium shortly.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">After paying, paste your Telebirr transaction ID below:</p>
              <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Telebirr transaction ID" />
              <Button onClick={submitRequest} disabled={submitting} variant="secondary" className="w-full">
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Submit for verification
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground text-center">{t("premium.afterPayment")}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Premium;
