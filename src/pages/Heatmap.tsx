import { MapPin, AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/contexts/LangContext";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DiseaseReport {
  id: string;
  region: string;
  region_am: string;
  disease: string;
  disease_am: string;
  severity: string;
  report_count: number;
  latitude: number;
  longitude: number;
  is_active: boolean;
}

const severityColors = {
  high: { fill: "rgba(239,68,68,0.55)", stroke: "#ef4444", pulse: "rgba(239,68,68,0.3)" },
  medium: { fill: "rgba(234,179,8,0.5)", stroke: "#eab308", pulse: "rgba(234,179,8,0.25)" },
  low: { fill: "rgba(34,197,94,0.45)", stroke: "#22c55e", pulse: "rgba(34,197,94,0.2)" },
};

const severityBadge = {
  high: "bg-alert text-alert-foreground",
  medium: "bg-accent text-accent-foreground",
  low: "bg-success text-success-foreground",
};

// Convert lat/lng to SVG coordinates (Ethiopia bounding box approx: lat 3-15, lng 33-48)
function toSvg(lat: number, lng: number): { x: number; y: number } {
  const minLat = 3, maxLat = 15, minLng = 33, maxLng = 48;
  const x = ((lng - minLng) / (maxLng - minLng)) * 440 + 30;
  const y = ((maxLat - lat) / (maxLat - minLat)) * 340 + 30;
  return { x, y };
}

const Heatmap = () => {
  const { t, lang } = useLang();
  const [reports, setReports] = useState<DiseaseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DiseaseReport | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const fetchReports = async () => {
      const { data } = await supabase
        .from("disease_reports")
        .select("*")
        .eq("is_active", true)
        .order("report_count", { ascending: false });
      if (data) setReports(data as unknown as DiseaseReport[]);
      setLoading(false);
    };
    fetchReports();
  }, []);

  return (
    <div className="container py-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-heading font-bold flex items-center justify-center gap-2">
          <MapPin className="h-7 w-7 text-alert" />
          {t("heatmap.title")}
        </h1>
        <p className="text-muted-foreground">{t("heatmap.subtitle")}</p>
      </div>

      <div className="flex gap-3 justify-center text-xs font-medium">
        {(["high", "medium", "low"] as const).map((s) => (
          <span key={s} className={`px-3 py-1 rounded-full ${severityBadge[s]}`}>
            {s === "high" ? "🔴 High" : s === "medium" ? "🟡 Medium" : "🟢 Low"}
          </span>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid md:grid-cols-5 gap-4">
          {/* Map */}
          <div className="md:col-span-3 bg-card border border-border rounded-xl p-3 relative overflow-hidden">
            <svg ref={svgRef} viewBox="0 0 500 400" className="w-full h-auto">
              {/* Ethiopia outline (more accurate simplified shape) */}
              <path
                d="M 95,95 L 145,80 L 195,72 L 240,68 L 280,72 L 315,82 L 345,98 L 372,118 L 395,140 L 418,158 L 445,172 L 462,190 L 470,215 L 460,238 L 442,255 L 418,268 L 395,278 L 372,290 L 358,310 L 345,332 L 322,348 L 295,355 L 265,358 L 232,352 L 200,342 L 172,328 L 148,308 L 128,285 L 110,258 L 95,228 L 82,198 L 70,168 L 65,138 L 72,115 Z"
                fill="hsl(var(--secondary))"
                stroke="hsl(var(--primary))"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Region label */}
              <text x="250" y="215" textAnchor="middle" fontSize="11" fontWeight="700" fill="hsl(var(--muted-foreground))" opacity="0.5" style={{ letterSpacing: "2px" }}>ETHIOPIA</text>
              {/* Grid lines */}
              {[5,7,9,11,13].map(lat => {
                const { y } = toSvg(lat, 33);
                return <line key={`lat${lat}`} x1="30" y1={y} x2="470" y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="4" opacity="0.4" />;
              })}
              {[35,37,39,41,43,45].map(lng => {
                const { x } = toSvg(3, lng);
                return <line key={`lng${lng}`} x1={x} y1="30" x2={x} y2="370" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="4" opacity="0.4" />;
              })}

              {/* Hotspots */}
              {reports.map((r, i) => {
                const { x, y } = toSvg(r.latitude, r.longitude);
                const colors = severityColors[r.severity as keyof typeof severityColors] || severityColors.low;
                const radius = Math.min(12 + r.report_count * 0.15, 35);
                return (
                  <g key={r.id} onClick={() => setSelected(r)} className="cursor-pointer">
                    {/* Pulse ring */}
                    <circle cx={x} cy={y} r={radius + 8} fill="none" stroke={colors.stroke} strokeWidth="1.5" opacity="0.4">
                      <animate attributeName="r" from={String(radius)} to={String(radius + 16)} dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                    </circle>
                    {/* Main hotspot */}
                    <circle cx={x} cy={y} r={radius} fill={colors.fill} stroke={colors.stroke} strokeWidth="2" />
                    {/* Label */}
                    <text x={x} y={y + 4} textAnchor="middle" fontSize="9" fontWeight="600" fill="hsl(var(--foreground))">
                      {r.report_count}
                    </text>
                  </g>
                );
              })}
            </svg>
            <p className="text-[10px] text-muted-foreground text-center mt-1">{lang === "am" ? "ክብ መጠን = የሪፖርት ብዛት" : "Circle size = report count"}</p>
          </div>

          {/* Side list */}
          <div className="md:col-span-2 space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {reports.map((z, i) => (
              <motion.div
                key={z.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(z)}
                className={`bg-card border rounded-lg p-3 flex items-center gap-3 cursor-pointer transition-colors ${
                  selected?.id === z.id ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg ${severityBadge[z.severity as keyof typeof severityBadge]} flex items-center justify-center shrink-0`}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{lang === "am" ? z.region_am : z.region}</h3>
                  <p className="text-xs text-muted-foreground truncate">{lang === "am" ? z.disease_am : z.disease}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">{z.report_count}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Detail popup */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-4 flex items-start gap-4"
        >
          <div className={`w-12 h-12 rounded-xl ${severityBadge[selected.severity as keyof typeof severityBadge]} flex items-center justify-center shrink-0`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{lang === "am" ? selected.region_am : selected.region}</h3>
            <p className="text-muted-foreground">{lang === "am" ? selected.disease_am : selected.disease}</p>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="font-medium">{selected.report_count} {t("heatmap.reports")}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${severityBadge[selected.severity as keyof typeof severityBadge]}`}>
                {selected.severity.toUpperCase()}
              </span>
            </div>
          </div>
          <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
        </motion.div>
      )}
    </div>
  );
};

export default Heatmap;
