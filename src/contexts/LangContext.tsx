import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "en" | "am";

const translations = {
  // Navbar
  "nav.home": { en: "Home", am: "መነሻ" },
  "nav.scan": { en: "AI Scan", am: "AI ዲያግኖስ" },
  "nav.heatmap": { en: "Heatmap", am: "የበሽታ ካርታ" },
  "nav.inputs": { en: "Smart Inputs", am: "ግብዓት መምረጫ" },
  "nav.wisdom": { en: "Wisdom Wiki", am: "የጥበብ ዊኪ" },
  "nav.animalBank": { en: "Animal Bank", am: "የእንስሳ ባንክ" },
  "nav.premium": { en: "Premium", am: "ፕሪሚየም" },
  "nav.weather": { en: "Weather", am: "አየር" },
  "nav.forum": { en: "Forum", am: "መድረክ" },
  "nav.marketplace": { en: "Market", am: "ገበያ" },
  "nav.cropCalendar": { en: "Crop Calendar", am: "የሰብል ቀን" },
  "nav.prices": { en: "Prices", am: "ዋጋ" },
  "nav.dashboard": { en: "Dashboard", am: "ዳሽቦርድ" },

  // Hero
  "hero.tagline": { en: "Healthy Farm, Healthy Life", am: "ጤናማ እርሻ ፣ ጤናማ ህይወት" },
  "hero.desc": { en: "AI-driven diagnosis and community-based disease prevention for Ethiopian crops and livestock.", am: "ለኢትዮጵያ ሰብሎችና እንስሳት በ AI የሚሰራ ምርመራ እና ማህበረሰብ-ተኮር የበሽታ መከላከያ።" },
  "hero.cta": { en: "Start AI Diagnosis", am: "AI ምርመራ ጀምር" },
  "hero.features": { en: "What Can Tena-Ersha Do?", am: "ጤና-እርሻ ምን ያደርጋል?" },

  // AI Scan
  "scan.title": { en: "AI Scan Center", am: "AI ዲያግኖስ ማዕከል" },
  "scan.subtitle": { en: "Upload a photo of the affected plant or animal", am: "የታመመውን ተክል ወይም እንስሳ ፎቶ ያስገቡ" },
  "scan.upload": { en: "Tap to upload or take photo", am: "ፎቶ ያንሱ ወይም ከጋለሪ ይምረጡ" },
  "scan.retake": { en: "Retake", am: "እንደገና" },
  "scan.diagnose": { en: "Diagnose", am: "ምርመራ" },
  "scan.analyzing": { en: "Analyzing...", am: "እየተመረመረ ነው..." },
  "scan.match": { en: "match", am: "ተመሳሳይ" },
  "scan.plant": { en: "Plant", am: "ተክል" },
  "scan.animal": { en: "Animal", am: "እንስሳ" },

  // Heatmap
  "heatmap.title": { en: "National Disease Heatmap", am: "ብሔራዊ የበሽታ ካርታ" },
  "heatmap.subtitle": { en: "Danger zones across Ethiopia", am: "በኢትዮጵያ ውስጥ ያሉ አደገኛ አካባቢዎች" },
  "heatmap.reports": { en: "reports", am: "ሪፖርቶች" },

  // Smart Inputs
  "inputs.title": { en: "Smart Input Matchmaker", am: "ግብዓት መምረጫ" },
  "inputs.subtitle": { en: "Best inputs for your region", am: "ለአካባቢዎ ምርጥ ግብዓቶች" },
  "inputs.select": { en: "Select your region", am: "ክልልዎን ይምረጡ" },
  "inputs.seeds": { en: "Recommended Seeds", am: "የሚመከሩ ዘሮች" },
  "inputs.fertilizers": { en: "Fertilizers", am: "ማዳበሪያ" },
  "inputs.feed": { en: "Animal Feed", am: "የእንስሳ መኖ" },

  // Wisdom Wiki
  "wisdom.title": { en: "Traditional Wisdom Wiki", am: "የባህል ጥበብ ዊኪ" },
  "wisdom.subtitle": { en: "Ancient Ethiopian remedies", am: "የኢትዮጵያ ባህላዊ መድሃኒቶች" },
  "wisdom.search": { en: "Search remedies...", am: "መድሃኒቶችን ፈልግ..." },
  "wisdom.all": { en: "All", am: "ሁሉም" },
  "wisdom.plant": { en: "Plant", am: "ተክል" },
  "wisdom.animal": { en: "Animal", am: "እንስሳ" },
  "wisdom.noResults": { en: "No remedies found. Try a different search.", am: "ምንም መድሃኒት አልተገኘም። ሌላ ፍለጋ ይሞክሩ።" },

  // Animal Bank
  "animal.title": { en: "The Animal Bank", am: "የእንስሳ ባንክ" },
  "animal.subtitle": { en: "Track livestock health for insurance & loans", am: "ለኢንሹራንስ እና ብድር የእንስሳ ጤና ይከታተሉ" },
  "animal.add": { en: "Add Animal", am: "እንስሳ ያክሉ" },
  "animal.name": { en: "Animal name", am: "የእንስሳ ስም" },
  "animal.type": { en: "Type (Cow, Goat...)", am: "ዓይነት (ላም, ፍየል...)" },
  "animal.notes": { en: "Health notes", am: "የጤና ማስታወሻ" },
  "animal.save": { en: "Save", am: "አስቀምጥ" },
  "animal.lastCheckup": { en: "Last checkup", am: "የመጨረሻ ምርመራ" },

  // Premium
  "premium.title": { en: "Unlock Premium", am: "ፕሪሚየም ያግኙ" },
  "premium.subtitle": { en: "Get Instant AI Diagnosis & Community Protection", am: "ፈጣን AI ምርመራ እና የማህበረሰብ ጥበቃ ያግኙ" },
  "premium.month": { en: "/ month", am: "/ ወር" },
  "premium.payWith": { en: "Pay with Telebirr", am: "በቴሌብር ይክፈሉ" },
  "premium.transfer": { en: "Transfer", am: "ያስተላልፉ" },
  "premium.to": { en: "to", am: "ወደ" },
  "premium.account": { en: "Account", am: "አካውንት" },
  "premium.afterPayment": { en: "After payment, your account will be activated within 24 hours.", am: "ክፍያ ከፈጸሙ በኋላ አካውንትዎ በ24 ሰዓት ውስጥ ይሰራል።" },

  // Features
  "feature.scan": { en: "AI Scan Center", am: "AI ዲያግኖስ ማዕከል" },
  "feature.scanDesc": { en: "Upload photos of sick plants or animals for instant AI diagnosis.", am: "የታመሙ ተክሎችን ወይም እንስሳትን ፎቶ ለፈጣን AI ምርመራ ያስገቡ።" },
  "feature.heatmap": { en: "Disease Heatmap", am: "የበሽታ ካርታ" },
  "feature.heatmapDesc": { en: "Interactive map showing danger zones across Ethiopia.", am: "በኢትዮጵያ ውስጥ ያሉ አደገኛ ቦታዎችን የሚያሳይ ካርታ።" },
  "feature.inputs": { en: "Smart Inputs", am: "ግብዓት መምረጫ" },
  "feature.inputsDesc": { en: "Best seeds, fertilizers & feed for your specific region.", am: "ለአካባቢዎ ምርጥ ዘሮች ፣ ማዳበሪያ እና መኖ።" },
  "feature.wisdom": { en: "Wisdom Wiki", am: "የጥበብ ዊኪ" },
  "feature.wisdomDesc": { en: "Ancient Ethiopian herbal & organic cures database.", am: "የኢትዮጵያ ባህላዊ ፈውሶች ዳታቤዝ።" },
  "feature.animalBank": { en: "Animal Bank", am: "የእንስሳ ባንክ" },
  "feature.animalBankDesc": { en: "Track livestock health for micro-insurance & loans.", am: "ለኢንሹራንስና ብድር የእንስሳ ጤና ይከታተሉ።" },
  "feature.premium": { en: "Go Premium", am: "ፕሪሚየም" },
  "feature.premiumDesc": { en: "Unlock full AI diagnosis & community protection.", am: "ሙሉ AI ምርመራና የማህበረሰብ ጥበቃ ያግኙ።" },

  // Premium features list
  "pf.1": { en: "Unlimited AI plant & animal diagnosis", am: "ያልተገደበ AI ምርመራ" },
  "pf.2": { en: "Priority disease alerts for your region", am: "ለአካባቢዎ ቅድሚያ የበሽታ ማስጠንቀቂያ" },
  "pf.3": { en: "Full Traditional Wisdom database access", am: "ሙሉ ባህላዊ ጥበብ ዳታቤዝ" },
  "pf.4": { en: "Animal Bank with insurance reports", am: "ከኢንሹራንስ ሪፖርት ጋር የእንስሳ ባንክ" },
  "pf.5": { en: "Smart Input recommendations", am: "ግብዓት ምክሮች" },
  "pf.6": { en: "Community expert consultations", am: "ከባለሙያዎች ጋር ምክክር" },

  // Footer
  "footer.tagline": { en: "Healthy Farm, Healthy Life", am: "ጤናማ እርሻ ፣ ጤናማ ህይወት" },
  "footer.founder": { en: "Founded by Naol Mesfin", am: "በናኦል መስፍን የተመሰረተ" },

  // Auth
  "auth.login": { en: "Log In", am: "ግባ" },
  "auth.signup": { en: "Sign Up", am: "ተመዝገብ" },
  "auth.loginSubtitle": { en: "Sign in to your farm account", am: "ወደ የእርሻ አካውንትዎ ይግቡ" },
  "auth.signupSubtitle": { en: "Create your farm account", am: "የእርሻ አካውንት ይፍጠሩ" },
  "auth.email": { en: "Email", am: "ኢሜይል" },
  "auth.password": { en: "Password", am: "የይለፍ ቃል" },
  "auth.error": { en: "Error", am: "ስህተት" },
  "auth.checkEmail": { en: "Check your email", am: "ኢሜይልዎን ያረጋግጡ" },
  "auth.checkEmailDesc": { en: "We sent you a confirmation link.", am: "የማረጋገጫ ሊንክ ልከንልዎታል።" },
  "auth.noAccount": { en: "Don't have an account?", am: "አካውንት የለዎትም?" },
  "auth.hasAccount": { en: "Already have an account?", am: "አካውንት አለዎት?" },
  "auth.loginRequired": { en: "Log in to track your livestock health records.", am: "የእንስሳ ጤና መዝገብ ለመከታተል ይግቡ።" },
  "auth.logout": { en: "Log Out", am: "ውጣ" },

  // Animal Bank extra
  "animal.empty": { en: "No animals yet. Add your first one!", am: "ገና እንስሳ የለም። የመጀመሪያውን ያክሉ!" },

  // Common
  "lang.switch": { en: "አማ", am: "EN" },
} as const;

type TranslationKey = keyof typeof translations;

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LangContext = createContext<LangContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export const LangProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("en");
  const t = (key: TranslationKey) => translations[key]?.[lang] || key;
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
