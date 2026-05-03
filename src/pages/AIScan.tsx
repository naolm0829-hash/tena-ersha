import { useState, useRef } from "react";
import { Camera, Upload, Loader2, Leaf, Bug } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const AIScan = () => {
  const { t } = useLang();
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanType, setScanType] = useState<"plant" | "animal">("plant");
  const [result, setResult] = useState<null | { name: string; confidence: number; advice: string }>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("diagnose", {
        body: { imageBase64: image, scanType },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Error", description: data.error, variant: "destructive" });
        return;
      }
      setResult(data);
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message || "Please try again", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="container py-8 max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-heading font-bold flex items-center justify-center gap-2">
          <Camera className="h-7 w-7 text-success" />
          {t("scan.title")}
        </h1>
        <p className="text-muted-foreground">{t("scan.subtitle")}</p>
      </div>

      {/* Scan type toggle */}
      <div className="flex gap-2 justify-center">
        {(["plant", "animal"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setScanType(type)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              scanType === type ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {type === "plant" ? `🌿 ${t("scan.plant")}` : `🐄 ${t("scan.animal")}`}
          </button>
        ))}
      </div>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />

      {!image ? (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-border rounded-xl py-16 flex flex-col items-center gap-3 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Upload className="h-12 w-12" />
          <span className="font-medium">{t("scan.upload")}</span>
        </motion.button>
      ) : (
        <div className="space-y-4">
          <img src={image} alt="Uploaded" className="w-full rounded-xl border border-border" />
          <div className="flex gap-3">
            <button
              onClick={() => { setImage(null); setResult(null); }}
              className="flex-1 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium"
            >
              {t("scan.retake")}
            </button>
            <button
              onClick={analyze}
              disabled={analyzing}
              className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {analyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Bug className="h-5 w-5" />}
              {analyzing ? t("scan.analyzing") : t("scan.diagnose")}
            </button>
          </div>
        </div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
              <Leaf className="h-5 w-5 text-alert" />
              {result.name}
            </h3>
            <span className="text-sm font-semibold bg-alert/10 text-alert px-2 py-0.5 rounded">
              {result.confidence}% {t("scan.match")}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{result.advice}</p>
        </motion.div>
      )}
    </div>
  );
};

export default AIScan;
