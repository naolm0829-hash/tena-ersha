import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, Mail, Lock, Loader2, User, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";
import { useToast } from "@/hooks/use-toast";

const COUNTRIES: { code: string; name: string; dial: string }[] = [
  { code: "ET", name: "Ethiopia", dial: "+251" },
  { code: "KE", name: "Kenya", dial: "+254" },
  { code: "UG", name: "Uganda", dial: "+256" },
  { code: "TZ", name: "Tanzania", dial: "+255" },
  { code: "RW", name: "Rwanda", dial: "+250" },
  { code: "SD", name: "Sudan", dial: "+249" },
  { code: "SS", name: "South Sudan", dial: "+211" },
  { code: "SO", name: "Somalia", dial: "+252" },
  { code: "DJ", name: "Djibouti", dial: "+253" },
  { code: "ER", name: "Eritrea", dial: "+291" },
  { code: "EG", name: "Egypt", dial: "+20" },
  { code: "NG", name: "Nigeria", dial: "+234" },
  { code: "GH", name: "Ghana", dial: "+233" },
  { code: "ZA", name: "South Africa", dial: "+27" },
  { code: "US", name: "United States", dial: "+1" },
  { code: "GB", name: "United Kingdom", dial: "+44" },
  { code: "CA", name: "Canada", dial: "+1" },
  { code: "DE", name: "Germany", dial: "+49" },
  { code: "FR", name: "France", dial: "+33" },
  { code: "IT", name: "Italy", dial: "+39" },
  { code: "ES", name: "Spain", dial: "+34" },
  { code: "NL", name: "Netherlands", dial: "+31" },
  { code: "SE", name: "Sweden", dial: "+46" },
  { code: "NO", name: "Norway", dial: "+47" },
  { code: "AE", name: "UAE", dial: "+971" },
  { code: "SA", name: "Saudi Arabia", dial: "+966" },
  { code: "IN", name: "India", dial: "+91" },
  { code: "CN", name: "China", dial: "+86" },
  { code: "JP", name: "Japan", dial: "+81" },
  { code: "AU", name: "Australia", dial: "+61" },
  { code: "BR", name: "Brazil", dial: "+55" },
  { code: "MX", name: "Mexico", dial: "+52" },
];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("ET");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { t } = useLang();
  const { toast } = useToast();
  const navigate = useNavigate();

  const dial = COUNTRIES.find((c) => c.code === country)?.dial || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) toast({ title: t("auth.error"), description: error.message, variant: "destructive" });
      else navigate("/dashboard");
    } else {
      if (!fullName.trim() || !phone.trim()) {
        toast({ title: t("auth.error"), description: "Name and phone are required", variant: "destructive" });
        setLoading(false);
        return;
      }
      const fullPhone = `${dial} ${phone.trim()}`;
      const countryName = COUNTRIES.find((c) => c.code === country)?.name || country;
      const { error } = await signUp(email, password, { full_name: fullName.trim(), phone: fullPhone, country: countryName });
      if (error) toast({ title: t("auth.error"), description: error.message, variant: "destructive" });
      else toast({ title: t("auth.checkEmail"), description: t("auth.checkEmailDesc") });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <Leaf className="h-10 w-10 text-primary mx-auto" />
          <h1 className="text-2xl font-heading font-bold text-foreground">ጤና-እርሻ</h1>
          <p className="text-muted-foreground text-sm">
            {isLogin ? t("auth.loginSubtitle") : t("auth.signupSubtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-foreground"
                  required
                />
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <select
                  value={country} onChange={(e) => setCountry(e.target.value)}
                  className="px-2 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.dial} {c.code}</option>
                  ))}
                </select>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-foreground"
                    required
                  />
                </div>
              </div>
            </>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.email")}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-foreground"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.password")}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-foreground"
              required minLength={6}
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLogin ? t("auth.login") : t("auth.signup")}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium hover:underline">
            {isLogin ? t("auth.signup") : t("auth.login")}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
