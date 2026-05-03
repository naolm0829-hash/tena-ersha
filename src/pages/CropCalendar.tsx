import { useEffect, useState } from "react";
import { Calendar, Sprout, Sun, CloudRain, Snowflake, MapPin, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useLang } from "@/contexts/LangContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CropSeason {
  id: string;
  crop: string;
  cropAm: string;
  plantMonth: number[];
  harvestMonth: number[];
  regions: string[];
  tips: string;
  tipsAm: string;
}

interface CropCalendarRow {
  id: string;
  crop_name: string;
  crop_name_am: string;
  planting_months: number[];
  harvest_months: number[];
  regions: string[];
  tips: string;
  tips_am: string;
}

const normalizeCrop = (row: CropCalendarRow): CropSeason => ({
  id: row.id,
  crop: row.crop_name,
  cropAm: row.crop_name_am,
  plantMonth: row.planting_months.map((month) => month - 1),
  harvestMonth: row.harvest_months.map((month) => month - 1),
  regions: row.regions,
  tips: row.tips,
  tipsAm: row.tips_am,
});

const months = [
  { en: "Jan", am: "ጥር" }, { en: "Feb", am: "የካ" }, { en: "Mar", am: "መጋ" },
  { en: "Apr", am: "ሚያ" }, { en: "May", am: "ግን" }, { en: "Jun", am: "ሰኔ" },
  { en: "Jul", am: "ሐም" }, { en: "Aug", am: "ነሐ" }, { en: "Sep", am: "መስ" },
  { en: "Oct", am: "ጥቅ" }, { en: "Nov", am: "ህዳ" }, { en: "Dec", am: "ታህ" },
];

const seasons = [
  { name: "Bega (Dry)", nameAm: "በጋ (ደረቅ)", months: [10, 11, 0, 1], icon: Sun, color: "text-amber-500" },
  { name: "Belg (Short Rains)", nameAm: "በልግ (አጭር ዝናብ)", months: [2, 3, 4], icon: CloudRain, color: "text-blue-400" },
  { name: "Kiremt (Main Rains)", nameAm: "ክረምት (ዋና ዝናብ)", months: [5, 6, 7, 8], icon: CloudRain, color: "text-blue-600" },
  { name: "Tsedey (Harvest)", nameAm: "ፀደይ (መኸር)", months: [9], icon: Sprout, color: "text-green-500" },
];

interface WeatherSummary {
  rainTotal7d: number;
  avgTempMax: number;
  avgTempMin: number;
  rainyDays: number;
  locationName: string;
}

const CropCalendar = () => {
  const { lang } = useLang();
  const [selectedCrop, setSelectedCrop] = useState<CropSeason | null>(null);
  const [crops, setCrops] = useState<CropSeason[]>([]);
  const [cropsLoading, setCropsLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherSummary | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const currentMonth = new Date().getMonth();

  const currentSeason = seasons.find(s => s.months.includes(currentMonth));

  useEffect(() => {
    const fetchCrops = async () => {
      setCropsLoading(true);
      const { data, error } = await supabase
        .from("crop_calendar_entries" as any)
        .select("id,crop_name,crop_name_am,planting_months,harvest_months,regions,tips,tips_am")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) {
        toast({ title: lang === "am" ? "ሰብሎችን ማግኘት አልተቻለም" : "Couldn't load crops", description: error.message, variant: "destructive" });
        setCrops([]);
      } else {
        setCrops(((data ?? []) as unknown as CropCalendarRow[]).map(normalizeCrop));
      }
      setCropsLoading(false);
    };

    fetchCrops();
  }, [lang]);

  const fetchWeatherForLocation = async (lat: number, lon: number, name: string) => {
    setWeatherLoading(true);
    try {
      const r = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Africa/Addis_Ababa&forecast_days=7`
      );
      const data = await r.json();
      const rain: number[] = data.daily.precipitation_sum;
      const tMax: number[] = data.daily.temperature_2m_max;
      const tMin: number[] = data.daily.temperature_2m_min;
      setWeather({
        rainTotal7d: Math.round(rain.reduce((a, b) => a + b, 0)),
        avgTempMax: Math.round(tMax.reduce((a, b) => a + b, 0) / tMax.length),
        avgTempMin: Math.round(tMin.reduce((a, b) => a + b, 0) / tMin.length),
        rainyDays: rain.filter((x) => x > 1).length,
        locationName: name,
      });
    } catch {
      toast({ title: lang === "am" ? "የአየር ሁኔታ ማግኘት አልተቻለም" : "Couldn't fetch weather", variant: "destructive" });
    } finally {
      setWeatherLoading(false);
    }
  };

  const requestGpsAndFetch = () => {
    if (!navigator.geolocation) {
      toast({ title: lang === "am" ? "GPS አይደገፍም" : "GPS not supported", variant: "destructive" });
      return;
    }
    setWeatherLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        let name = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
        try {
          const g = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en&count=1`);
          const j = await g.json();
          if (j?.results?.[0]) name = `${j.results[0].name}, ${j.results[0].admin1 ?? j.results[0].country ?? ""}`.replace(/,\s*$/, "");
        } catch { /* ignore */ }
        await fetchWeatherForLocation(lat, lon, name);
      },
      (err) => {
        setWeatherLoading(false);
        toast({ title: lang === "am" ? "GPS ስህተት" : "GPS error", description: err.message, variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Build a planting verdict per crop based on month + weather
  const plantingAlert = (crop: CropSeason): { ok: boolean; msg: string } => {
    const inSeason = crop.plantMonth.includes(currentMonth);
    if (!weather) {
      return inSeason
        ? { ok: true, msg: lang === "am" ? "አሁን የመዝሪያ ወር ነው" : "It's the planting month" }
        : { ok: false, msg: lang === "am" ? "የመዝሪያ ወር አይደለም" : "Not the planting month" };
    }
    if (!inSeason) {
      return { ok: false, msg: lang === "am" ? "ወቅት አልደረሰም" : "Wait for planting season" };
    }
    if (weather.avgTempMax > 35) {
      return { ok: false, msg: lang === "am" ? "በጣም ሞቃት — ችግኝ ሊደርቅ ይችላል" : "Too hot — seedlings may dry out" };
    }
    if (weather.rainTotal7d < 5) {
      return { ok: false, msg: lang === "am" ? "በቂ ዝናብ የለም — ዝናብ ይጠብቁ" : "Too dry — wait for rain" };
    }
    if (weather.rainTotal7d > 100) {
      return { ok: false, msg: lang === "am" ? "ከባድ ዝናብ — ዘር ሊታጠብ ይችላል" : "Heavy rain — seeds may wash away" };
    }
    return {
      ok: true,
      msg: lang === "am"
        ? `ጥሩ ሁኔታ — ${weather.rainyDays} ቀን ዝናብ፣ ${weather.avgTempMax}°C ሙቀት`
        : `Good conditions — ${weather.rainyDays} rainy days, ${weather.avgTempMax}°C avg high`,
    };
  };


  return (
    <div className="container py-8 space-y-6 max-w-5xl">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-heading font-bold text-primary">
          📅 {lang === "am" ? "የሰብል ቀን መቁጠሪያ" : "Crop Calendar"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "am" ? "ለኢትዮጵያ ገበሬዎች የዘር እና የመኸር ጊዜ" : "Planting & harvest schedules for Ethiopian farmers"}
        </p>
      </div>

      {/* Current season indicator */}
      {currentSeason && (
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <currentSeason.icon className={`h-8 w-8 ${currentSeason.color}`} />
          <div>
            <p className="font-bold">{lang === "am" ? "አሁን ያለው ወቅት" : "Current Season"}</p>
            <p className="text-sm text-muted-foreground">
              {lang === "am" ? currentSeason.nameAm : currentSeason.name} — {lang === "am" ? months[currentMonth].am : months[currentMonth].en}
            </p>
          </div>
        </div>
      )}

      {/* GPS weather + planting alerts banner */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="font-bold flex items-center gap-2">
              <CloudRain className="h-4 w-4 text-blue-500" />
              {lang === "am" ? "የእርሻ የአየር ሁኔታ ምክር" : "Weather-based Planting Advice"}
            </p>
            {weather ? (
              <p className="text-xs text-muted-foreground mt-0.5">
                <MapPin className="h-3 w-3 inline mr-1" />
                {weather.locationName} · {weather.rainTotal7d}mm {lang === "am" ? "ዝናብ" : "rain"} (7d) · {weather.avgTempMin}°–{weather.avgTempMax}°C
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-0.5">
                {lang === "am" ? "የእርስዎ አካባቢ የአየር ሁኔታ ለማየት GPS ን ይክፈቱ" : "Enable GPS to see crop-specific advice for your farm"}
              </p>
            )}
          </div>
          <button
            onClick={requestGpsAndFetch}
            disabled={weatherLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition shrink-0"
          >
            {weatherLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
            {weather
              ? (lang === "am" ? "አድስ" : "Refresh")
              : (lang === "am" ? "የእኔን አካባቢ ተጠቀም" : "Use my GPS")}
          </button>
        </div>

        {/* In-season crops verdict list */}
        {weather && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border">
            {crops
              .filter((c) => c.plantMonth.includes(currentMonth))
              .map((c) => {
                const v = plantingAlert(c);
                return (
                  <div
                    key={c.id}
                    className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                      v.ok ? "bg-success/10 text-success-foreground" : "bg-muted"
                    }`}
                  >
                    {v.ok ? (
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold">{lang === "am" ? c.cropAm : c.crop}</p>
                      <p className="text-muted-foreground">{v.msg}</p>
                    </div>
                  </div>
                );
              })}
            {!cropsLoading && crops.filter((c) => c.plantMonth.includes(currentMonth)).length === 0 && (
              <p className="text-xs text-muted-foreground sm:col-span-2 text-center py-2">
                {lang === "am" ? "በዚህ ወር የሚዘራ ሰብል የለም" : "No crops in planting season this month"}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="text-left p-2 border-b border-border font-heading min-w-[120px]">
                {lang === "am" ? "ሰብል" : "Crop"}
              </th>
              {months.map((m, i) => (
                <th
                  key={i}
                  className={`p-2 border-b border-border text-center text-xs font-medium min-w-[40px] ${
                    i === currentMonth ? "bg-primary/10 text-primary font-bold" : ""
                  }`}
                >
                  {lang === "am" ? m.am : m.en}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cropsLoading && (
              <tr>
                <td colSpan={months.length + 1} className="p-8 text-center text-muted-foreground">
                  {lang === "am" ? "ሰብሎች እየጫኑ ነው..." : "Loading crop calendar..."}
                </td>
              </tr>
            )}
            {crops.map((crop) => (
              <tr
                key={crop.id}
                onClick={() => setSelectedCrop(selectedCrop?.id === crop.id ? null : crop)}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <td className="p-2 border-b border-border font-medium">
                  <div className="flex items-center gap-1">
                    <Sprout className="h-3.5 w-3.5 text-success" />
                    {lang === "am" ? crop.cropAm : crop.crop}
                  </div>
                </td>
                {months.map((_, i) => {
                  const isPlant = crop.plantMonth.includes(i);
                  const isHarvest = crop.harvestMonth.includes(i);
                  return (
                    <td
                      key={i}
                      className={`p-1 border-b border-border text-center ${
                        i === currentMonth ? "bg-primary/5" : ""
                      }`}
                    >
                      {isPlant && isHarvest ? (
                        <span className="inline-block w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-amber-400 mx-auto" title="Plant & Harvest" />
                      ) : isPlant ? (
                        <span className="inline-block w-6 h-6 rounded-full bg-blue-400 mx-auto" title="Planting" />
                      ) : isHarvest ? (
                        <span className="inline-block w-6 h-6 rounded-full bg-amber-400 mx-auto" title="Harvest" />
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-blue-400" /> {lang === "am" ? "የመዝሪያ ጊዜ" : "Planting"}</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-amber-400" /> {lang === "am" ? "የመኸር ጊዜ" : "Harvest"}</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-amber-400" /> {lang === "am" ? "ሁለቱም" : "Both"}</span>
      </div>

      {/* Crop detail */}
      {selectedCrop && (
        <div className="bg-card border border-primary/30 rounded-xl p-5 space-y-2 animate-in fade-in duration-200">
          <h3 className="font-heading font-bold text-lg text-primary">
            🌱 {lang === "am" ? selectedCrop.cropAm : selectedCrop.crop}
          </h3>
          {(() => {
            const v = plantingAlert(selectedCrop);
            return (
              <div className={`flex items-start gap-2 p-3 rounded-lg ${v.ok ? "bg-success/10" : "bg-muted"}`}>
                {v.ok ? <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />}
                <p className="text-sm font-medium">{v.msg}</p>
              </div>
            );
          })()}
          <p className="text-sm"><strong>{lang === "am" ? "ክልሎች:" : "Regions:"}</strong> {selectedCrop.regions.join(", ")}</p>
          <p className="text-sm"><strong>{lang === "am" ? "ምክር:" : "Tips:"}</strong> {lang === "am" ? selectedCrop.tipsAm : selectedCrop.tips}</p>
          <p className="text-sm">
            <strong>{lang === "am" ? "መዝሪያ:" : "Plant:"}</strong>{" "}
            {selectedCrop.plantMonth.map(m => lang === "am" ? months[m].am : months[m].en).join(", ")}
          </p>
          {selectedCrop.harvestMonth.length > 0 ? (
            <p className="text-sm">
              <strong>{lang === "am" ? "መኸር:" : "Harvest:"}</strong>{" "}
              {selectedCrop.harvestMonth.map(m => lang === "am" ? months[m].am : months[m].en).join(", ")}
            </p>
          ) : (
            <p className="text-sm"><strong>{lang === "am" ? "መኸር:" : "Harvest:"}</strong> {lang === "am" ? "ዘላቂ ሰብል" : "Perennial crop"}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CropCalendar;
