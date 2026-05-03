import { useState, useEffect } from "react";
import { HeartPulse, Plus, Trash2, Loader2, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/contexts/LangContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Animal {
  id: string;
  animal_name: string;
  animal_type: string;
  last_checkup: string;
  status: string;
  notes: string | null;
}

const statusBadge: Record<string, string> = {
  healthy: "bg-success text-success-foreground",
  sick: "bg-alert text-alert-foreground",
  recovering: "bg-accent text-accent-foreground",
};

const AnimalBank = () => {
  const { t } = useLang();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", type: "", notes: "" });

  const fetchAnimals = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("animal_health_records")
      .select("id, animal_name, animal_type, last_checkup, status, notes")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setAnimals(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchAnimals();
    else setLoading(false);
  }, [user]);

  const addAnimal = async () => {
    if (!form.name || !form.type || !user) return;
    setSaving(true);
    const { error } = await supabase.from("animal_health_records").insert({
      user_id: user.id,
      animal_name: form.name,
      animal_type: form.type,
      notes: form.notes || null,
      status: "healthy",
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setForm({ name: "", type: "", notes: "" });
      setShowAdd(false);
      fetchAnimals();
    }
    setSaving(false);
  };

  const deleteAnimal = async (id: string) => {
    const { error } = await supabase.from("animal_health_records").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setAnimals(animals.filter((a) => a.id !== id));
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-16 text-center space-y-4 max-w-md mx-auto">
        <HeartPulse className="h-12 w-12 text-primary mx-auto" />
        <h1 className="text-2xl font-heading font-bold">{t("animal.title")}</h1>
        <p className="text-muted-foreground">{t("auth.loginRequired")}</p>
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium"
        >
          <LogIn className="h-4 w-4" />
          {t("auth.login")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-heading font-bold flex items-center justify-center gap-2">
          <HeartPulse className="h-7 w-7 text-success" />
          {t("animal.title")}
        </h1>
        <p className="text-muted-foreground">{t("animal.subtitle")}</p>
      </div>

      <button
        onClick={() => setShowAdd(!showAdd)}
        className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2"
      >
        <Plus className="h-5 w-5" />
        {t("animal.add")}
      </button>

      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-card border border-border rounded-lg p-4 space-y-3">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={t("animal.name")}
            className="w-full px-4 py-2.5 rounded-lg bg-background border border-border"
          />
          <input
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            placeholder={t("animal.type")}
            className="w-full px-4 py-2.5 rounded-lg bg-background border border-border"
          />
          <input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder={t("animal.notes")}
            className="w-full px-4 py-2.5 rounded-lg bg-background border border-border"
          />
          <button
            onClick={addAnimal}
            disabled={saving}
            className="w-full py-2.5 rounded-lg bg-success text-success-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("animal.save")}
          </button>
        </motion.div>
      )}

      <div className="space-y-3">
        {animals.length === 0 && (
          <p className="text-center text-muted-foreground py-8">{t("animal.empty")}</p>
        )}
        {animals.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-lg p-4 flex items-start gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{a.animal_name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge[a.status] || "bg-muted text-muted-foreground"}`}>
                  {a.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{a.animal_type} · {t("animal.lastCheckup")}: {a.last_checkup}</p>
              {a.notes && <p className="text-sm text-muted-foreground mt-1">{a.notes}</p>}
            </div>
            <button
              onClick={() => deleteAnimal(a.id)}
              className="text-muted-foreground hover:text-alert transition-colors p-1"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AnimalBank;
