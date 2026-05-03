import { useState } from "react";
import { Flag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/contexts/LangContext";
import { toast } from "sonner";

interface ReportButtonProps {
  targetType: "forum_post" | "forum_reply" | "marketplace_listing";
  targetId: string;
}

const reasons = [
  { value: "spam", en: "Spam", am: "ስፓም" },
  { value: "inappropriate", en: "Inappropriate", am: "ተገቢ ያልሆነ" },
  { value: "fake", en: "Fake/Scam", am: "ሐሰት" },
  { value: "other", en: "Other", am: "ሌላ" },
];

const ReportButton = ({ targetType, targetId }: ReportButtonProps) => {
  const { user } = useAuth();
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  if (!user) return null;

  const submit = async (reason: string) => {
    setSending(true);
    const { error } = await supabase.from("reports" as any).insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason,
    } as any);
    setSending(false);
    setOpen(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(lang === "am" ? "ሪፖርት ተልኳል" : "Report submitted");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
        title={lang === "am" ? "ሪፖርት" : "Report"}
      >
        <Flag className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
          {reasons.map((r) => (
            <button
              key={r.value}
              onClick={() => submit(r.value)}
              disabled={sending}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors"
            >
              {lang === "am" ? r.am : r.en}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportButton;
