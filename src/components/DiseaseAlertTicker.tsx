import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/contexts/LangContext";

interface Alert {
  region: string;
  region_am: string;
  disease: string;
  disease_am: string;
  severity: string;
}

const severityEmoji: Record<string, string> = {
  high: "⚠️",
  medium: "🦠",
  low: "🟢",
};

const DiseaseAlertTicker = () => {
  const { lang } = useLang();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("disease_reports")
        .select("region, region_am, disease, disease_am, severity")
        .eq("is_active", true)
        .order("report_count", { ascending: false });
      if (data) setAlerts(data as unknown as Alert[]);
    };
    fetch();
  }, []);

  if (!alerts.length) return null;

  const items = alerts.map((a) => {
    const emoji = severityEmoji[a.severity] || "🦠";
    const region = lang === "am" ? a.region_am : a.region;
    const disease = lang === "am" ? a.disease_am : a.disease;
    return `${emoji} ${disease} — ${region}`;
  });

  const doubled = [...items, ...items];

  return (
    <div className="bg-alert text-alert-foreground overflow-hidden py-2 text-sm font-medium">
      <div className="ticker-scroll flex whitespace-nowrap">
        {doubled.map((text, i) => (
          <span key={i} className="mx-8">{text}</span>
        ))}
      </div>
    </div>
  );
};

export default DiseaseAlertTicker;
