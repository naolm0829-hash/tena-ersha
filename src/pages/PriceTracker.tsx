import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/integrations/supabase/client";

interface PriceEntry {
  crop: string;
  cropAm: string;
  prices: { date: string; price: number }[];
}

const PriceTracker = () => {
  const { lang } = useLang();
  const [prices, setPrices] = useState<PriceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState<PriceEntry | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      const { data, error } = await supabase
        .from("crop_prices")
        .select("crop_name, crop_name_am, price_per_quintal, recorded_at")
        .order("recorded_at", { ascending: true });

      if (error || !data || data.length === 0) {
        setLoading(false);
        return;
      }

      const grouped: Record<string, PriceEntry> = {};
      for (const row of data) {
        if (!grouped[row.crop_name]) {
          grouped[row.crop_name] = {
            crop: row.crop_name,
            cropAm: row.crop_name_am,
            prices: [],
          };
        }
        grouped[row.crop_name].prices.push({
          date: row.recorded_at,
          price: Number(row.price_per_quintal),
        });
      }
      setPrices(Object.values(grouped));
      setLoading(false);
    };
    fetchPrices();
  }, []);

  const getTrend = (entry: PriceEntry) => {
    const p = entry.prices;
    if (p.length < 2) return 0;
    return p[p.length - 1].price - p[p.length - 2].price;
  };

  const TrendIcon = ({ value }: { value: number }) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-success" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const maxPrice = selectedCrop
    ? Math.max(...selectedCrop.prices.map(p => p.price))
    : 0;

  return (
    <div className="container py-8 space-y-6 max-w-4xl">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-heading font-bold text-primary">
          📊 {lang === "am" ? "የዋጋ ተከታታይ" : "Price Tracker"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "am" ? "የሰብል ገበያ ዋጋ በጊዜ ሂደት (ብር/ኩንታል)" : "Crop market prices over time (ETB/quintal)"}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : prices.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {lang === "am" ? "ምንም ዋጋ አልተገኘም" : "No price data available yet."}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prices.map((entry) => {
              const trend = getTrend(entry);
              const current = entry.prices[entry.prices.length - 1];
              const isSelected = selectedCrop?.crop === entry.crop;
              return (
                <button
                  key={entry.crop}
                  onClick={() => setSelectedCrop(isSelected ? null : entry)}
                  className={`text-left bg-card border rounded-xl p-4 transition-all ${
                    isSelected ? "border-primary shadow-md" : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{lang === "am" ? entry.cropAm : entry.crop}</h3>
                      <p className="text-xs text-muted-foreground">{current.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{current.price.toLocaleString()}</p>
                      <div className="flex items-center gap-1 text-xs">
                        <TrendIcon value={trend} />
                        <span className={trend > 0 ? "text-success" : trend < 0 ? "text-destructive" : "text-muted-foreground"}>
                          {trend > 0 ? "+" : ""}{trend.toLocaleString()} ETB
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedCrop && (
            <div className="bg-card border border-border rounded-xl p-5 space-y-4 animate-in fade-in duration-200">
              <h3 className="font-heading font-bold text-lg text-primary">
                {lang === "am" ? selectedCrop.cropAm : selectedCrop.crop} — {lang === "am" ? "የዋጋ ሂደት" : "Price History"}
              </h3>
              <div className="flex items-end gap-2 h-40">
                {selectedCrop.prices.map((p) => (
                  <div key={p.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-medium">{p.price.toLocaleString()}</span>
                    <div
                      className="w-full rounded-t-md bg-primary/80"
                      style={{ height: `${(p.price / maxPrice) * 100}%`, minHeight: "8px" }}
                    />
                    <span className="text-xs text-muted-foreground">{p.date.slice(5)}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {lang === "am" ? "ብር/ኩንታል" : "ETB per quintal"}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PriceTracker;
