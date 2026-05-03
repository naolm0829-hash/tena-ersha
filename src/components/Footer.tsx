import { Leaf } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

const Footer = () => {
  const { t } = useLang();
  return (
    <footer className="bg-primary text-primary-foreground py-8 mt-12">
      <div className="container text-center space-y-2">
        <div className="flex items-center justify-center gap-2 font-heading font-bold text-lg">
          <Leaf className="h-5 w-5" />
          <span>ጤና-እርሻ · Tena-Ersha</span>
        </div>
        <p className="text-sm opacity-80">{t("footer.tagline")}</p>
        <p className="text-xs opacity-60">{t("footer.founder")} · © {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
};

export default Footer;
