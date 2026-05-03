import { Link } from "react-router-dom";
import { Camera, MapPin, Sprout, BookOpen, HeartPulse, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/contexts/LangContext";
import heroImage from "@/assets/hero-farmland.jpg";

const features = [
  { icon: Camera, titleKey: "feature.scan" as const, descKey: "feature.scanDesc" as const, path: "/scan", color: "bg-success text-success-foreground" },
  { icon: MapPin, titleKey: "feature.heatmap" as const, descKey: "feature.heatmapDesc" as const, path: "/heatmap", color: "bg-alert text-alert-foreground" },
  { icon: Sprout, titleKey: "feature.inputs" as const, descKey: "feature.inputsDesc" as const, path: "/inputs", color: "bg-accent text-accent-foreground" },
  { icon: BookOpen, titleKey: "feature.wisdom" as const, descKey: "feature.wisdomDesc" as const, path: "/wisdom", color: "bg-primary text-primary-foreground" },
  { icon: HeartPulse, titleKey: "feature.animalBank" as const, descKey: "feature.animalBankDesc" as const, path: "/animal-bank", color: "bg-success text-success-foreground" },
  { icon: Crown, titleKey: "feature.premium" as const, descKey: "feature.premiumDesc" as const, path: "/premium", color: "bg-accent text-accent-foreground" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Index = () => {
  const { t } = useLang();

  return (
    <div>
      <section className="relative w-full text-primary-foreground py-20 md:py-32 lg:py-40 overflow-hidden min-h-[70vh] flex items-center">
        <img src={heroImage} alt="Lush Ethiopian farmland" className="absolute inset-0 w-full h-full object-cover object-center" width={1920} height={1024} />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/65 to-primary/85" />
        <div className="container relative text-center space-y-6 z-10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-heading font-bold leading-tight"
          >
            ጤና-እርሻ
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl opacity-90 font-medium"
          >
            {t("hero.tagline")}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="max-w-xl mx-auto opacity-80"
          >
            {t("hero.desc")}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity"
            >
              <Camera className="h-5 w-5" />
              {t("hero.cta")}
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-10">
          {t("hero.features")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={f.path} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <Link to={f.path} className="block bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow group">
                <div className={`w-12 h-12 rounded-lg ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-semibold text-lg">{t(f.titleKey)}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t(f.descKey)}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
