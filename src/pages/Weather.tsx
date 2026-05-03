import { useState, useEffect } from "react";
import { Cloud, Droplets, Thermometer, Wind, Sun, CloudRain, Sprout, MapPin, Loader2 } from "lucide-react";
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { useLang } from "@/contexts/LangContext";
import { toast } from "@/hooks/use-toast";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const regions = [
  { name: "Addis Ababa", nameAm: "አዲስ አበባ", lat: 9.02, lon: 38.75 },
  { name: "Oromia (Adama)", nameAm: "ኦሮሚያ (አዳማ)", lat: 8.54, lon: 39.27 },
  { name: "Amhara (Bahir Dar)", nameAm: "አማራ (ባህር ዳር)", lat: 11.6, lon: 37.38 },
  { name: "Tigray (Mekelle)", nameAm: "ትግራይ (መቀሌ)", lat: 13.5, lon: 39.47 },
  { name: "SNNPR (Hawassa)", nameAm: "ደቡብ (ሃዋሳ)", lat: 7.06, lon: 38.48 },
  { name: "Sidama (Hawassa)", nameAm: "ሲዳማ (ሃዋሳ)", lat: 6.85, lon: 38.35 },
  { name: "Somali (Jijiga)", nameAm: "ሶማሌ (ጅጅጋ)", lat: 9.35, lon: 42.8 },
  { name: "Afar (Semera)", nameAm: "አፋር (ሰመራ)", lat: 11.79, lon: 41.01 },
  { name: "Benishangul-Gumuz", nameAm: "ቤኒሻንጉል ጉሙዝ", lat: 10.8, lon: 35.5 },
  { name: "Gambella", nameAm: "ጋምቤላ", lat: 8.25, lon: 34.59 },
  { name: "Harari (Harar)", nameAm: "ሐረሪ (ሀረር)", lat: 9.31, lon: 42.12 },
  { name: "Dire Dawa", nameAm: "ድሬ ዳዋ", lat: 9.6, lon: 41.85 },
];

interface DayWeather {
  date: string;
  tempMax: number;
  tempMin: number;
  rain: number;
  windSpeed: number;
  weatherCode: number;
}

const weatherLabel = (code: number, lang: string) => {
  if (code <= 1) return lang === "am" ? "ፀሃያማ" : "Clear";
  if (code <= 3) return lang === "am" ? "ደመናማ" : "Cloudy";
  if (code <= 48) return lang === "am" ? "ጭጋግ" : "Foggy";
  if (code <= 67) return lang === "am" ? "ዝናብ" : "Rain";
  if (code <= 77) return lang === "am" ? "በረዶ" : "Snow";
  return lang === "am" ? "ኃይለኛ ዝናብ" : "Storms";
};

const WeatherIcon = ({ code }: { code: number }) => {
  if (code <= 1) return <Sun className="h-8 w-8 text-yellow-500" />;
  if (code <= 3) return <Cloud className="h-8 w-8 text-muted-foreground" />;
  if (code <= 67) return <CloudRain className="h-8 w-8 text-blue-500" />;
  return <CloudRain className="h-8 w-8 text-destructive" />;
};

const farmingAdvice = (rain: number, tempMax: number, lang: string): string => {
  if (rain > 20) return lang === "am" ? "ከባድ ዝናብ — ከውሃ ጎርፍ ይጠንቀቁ" : "Heavy rain expected — watch for flooding";
  if (rain > 5) return lang === "am" ? "ዝናብ ይጠበቃል — ለመዝራት ጥሩ ቀን" : "Rain expected — good day for planting";
  if (tempMax > 35) return lang === "am" ? "ከፍተኛ ሙቀት — ሰብልና እንስሳ ውሃ ያጠጡ" : "High heat — water crops & livestock";
  if (rain === 0) return lang === "am" ? "ደረቅ ቀን — ለማጨድና ለማድረቅ ተስማሚ" : "Dry day — good for harvesting & drying";
  return lang === "am" ? "ተስማሚ ቀን ለእርሻ ሥራ" : "Good conditions for farm work";
};

const chartConfig = {
  rain: { label: "Rainfall", color: "hsl(var(--primary))" },
  tempMax: { label: "High °C", color: "hsl(var(--accent))" },
} satisfies ChartConfig;

const Weather = () => {
  const { lang } = useLang();
  const [selectedRegion, setSelectedRegion] = useState(0);
  const [forecast, setForecast] = useState<DayWeather[]>([]);
  const [loading, setLoading] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lon: number; name: string } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const activeLocation = gpsLocation
    ? { lat: gpsLocation.lat, lon: gpsLocation.lon, name: gpsLocation.name }
    : { lat: regions[selectedRegion].lat, lon: regions[selectedRegion].lon, name: lang === "am" ? regions[selectedRegion].nameAm : regions[selectedRegion].name };

  const requestGps = () => {
    if (!navigator.geolocation) {
      toast({ title: lang === "am" ? "GPS አይደገፍም" : "GPS not supported", variant: "destructive" });
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        let name = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
        try {
          const r = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en&count=1`);
          const j = await r.json();
          if (j?.results?.[0]) name = `${j.results[0].name}, ${j.results[0].admin1 ?? j.results[0].country ?? ""}`.replace(/,\s*$/, "");
        } catch { /* ignore */ }
        setGpsLocation({ lat, lon, name });
        setGpsLoading(false);
        toast({ title: lang === "am" ? "የእርስዎ አካባቢ ተገኝቷል" : "Your location detected", description: name });
      },
      (err) => {
        setGpsLoading(false);
        toast({
          title: lang === "am" ? "GPS ስህተት" : "GPS error",
          description: err.message,
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    setLoading(true);
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${activeLocation.lat}&longitude=${activeLocation.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode&timezone=Africa/Addis_Ababa&forecast_days=14`
    )
      .then((r) => r.json())
      .then((data) => {
        const days: DayWeather[] = data.daily.time.map((d: string, i: number) => ({
          date: d,
          tempMax: data.daily.temperature_2m_max[i],
          tempMin: data.daily.temperature_2m_min[i],
          rain: data.daily.precipitation_sum[i],
          windSpeed: data.daily.windspeed_10m_max[i],
          weatherCode: data.daily.weathercode[i],
        }));
        setForecast(days);
      })
      .catch(() => setForecast([]))
      .finally(() => setLoading(false));
  }, [activeLocation.lat, activeLocation.lon]);

  const dayName = (dateStr: string) => {
    const d = new Date(dateStr);
    const days = lang === "am"
      ? ["እሁድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "አርብ", "ቅዳሜ"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[d.getDay()];
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-heading font-bold text-primary">
          {lang === "am" ? "🌦️ የአየር ሁኔታ ትንበያ" : "🌦️ Weather Dashboard"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "am" ? "ለኢትዮጵያ ክልሎች 14-ቀን ትንበያ" : "14-day forecast for Ethiopian regions"}
        </p>
      </div>

      {/* Active location + GPS button */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
          <MapPin className="h-4 w-4" />
          {activeLocation.name}
          {gpsLocation && (
            <button
              onClick={() => setGpsLocation(null)}
              className="ml-1 text-xs opacity-70 hover:opacity-100"
              title={lang === "am" ? "አጥፋ" : "Clear"}
            >
              ✕
            </button>
          )}
        </div>
        <button
          onClick={requestGps}
          disabled={gpsLoading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition"
        >
          {gpsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          {lang === "am" ? "የእኔን አካባቢ ተጠቀም" : "Use my GPS location"}
        </button>
      </div>

      {/* Region selector (fallback) */}
      {!gpsLocation && (
        <div className="flex flex-wrap gap-2 justify-center">
          {regions.map((r, i) => (
            <button
              key={r.name}
              onClick={() => setSelectedRegion(i)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                i === selectedRegion
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {lang === "am" ? r.nameAm : r.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">
          {lang === "am" ? "እየጫነ ነው..." : "Loading forecast..."}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {forecast.map((day, i) => (
            <div
              key={day.date}
              className={`bg-card border border-border rounded-xl p-4 text-center space-y-2 ${
                i === 0 ? "ring-2 ring-primary" : ""
              }`}
            >
              <p className="text-sm font-bold">{dayName(day.date)}</p>
              <p className="text-xs text-muted-foreground">{day.date.slice(5)}</p>
              <div className="flex justify-center">
                <WeatherIcon code={day.weatherCode} />
              </div>
              <p className="text-xs font-medium">{weatherLabel(day.weatherCode, lang)}</p>
              <div className="flex items-center justify-center gap-1 text-xs">
                <Thermometer className="h-3 w-3 text-destructive" />
                <span className="font-bold">{day.tempMax}°</span>
                <span className="text-muted-foreground">/ {day.tempMin}°</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-xs text-blue-600">
                <Droplets className="h-3 w-3" />
                <span>{day.rain}mm</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Wind className="h-3 w-3" />
                <span>{day.windSpeed} km/h</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Farming advice for today */}
      {forecast.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex items-start gap-3">
          <Sprout className="h-6 w-6 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-primary">
              {lang === "am" ? "የእርሻ ምክር - ዛሬ" : "Farming Tip — Today"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {farmingAdvice(forecast[0].rain, forecast[0].tempMax, lang)}
            </p>
          </div>
        </div>
      )}

      {forecast.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading font-bold text-lg">
                {lang === "am" ? "የ14 ቀን ዝናብና ሙቀት አዝማሚያ" : "14-day Rainfall & Temperature Trend"}
              </h2>
              <p className="text-xs text-muted-foreground">{activeLocation.name}</p>
            </div>
            <CloudRain className="h-5 w-5 text-primary" />
          </div>
          <ChartContainer config={chartConfig} className="h-[260px] w-full aspect-auto">
            <ComposedChart data={forecast} margin={{ left: 0, right: 4, top: 10, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => dayName(String(value))}
              />
              <YAxis yAxisId="rain" tickLine={false} axisLine={false} tickMargin={8} width={32} unit="mm" />
              <YAxis yAxisId="temp" orientation="right" tickLine={false} axisLine={false} tickMargin={8} width={32} unit="°" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area yAxisId="rain" type="monotone" dataKey="rain" fill="var(--color-rain)" fillOpacity={0.18} stroke="var(--color-rain)" strokeWidth={2} />
              <Line yAxisId="temp" type="monotone" dataKey="tempMax" stroke="var(--color-tempMax)" strokeWidth={3} dot={false} />
            </ComposedChart>
          </ChartContainer>
        </div>
      )}
    </div>
  );
};

export default Weather;
