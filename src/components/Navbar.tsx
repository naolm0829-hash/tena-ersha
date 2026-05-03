import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu, X, Globe, LogIn, LogOut, Shield, ChevronDown,
  Camera, MapPin, Droplets, BookOpen, Heart, CloudSun,
  MessageSquare, ShoppingCart, CalendarDays, TrendingUp,
  LayoutDashboard, Crown,
} from "lucide-react";
import { useLang } from "@/contexts/LangContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const navGroups = [
  {
    label: { en: "Farm Tools", am: "የእርሻ መሳሪያ" },
    items: [
      { path: "/scan", key: "nav.scan" as const, icon: Camera },
      { path: "/heatmap", key: "nav.heatmap" as const, icon: MapPin },
      { path: "/inputs", key: "nav.inputs" as const, icon: Droplets },
      { path: "/crop-calendar", key: "nav.cropCalendar" as const, icon: CalendarDays },
      { path: "/weather", key: "nav.weather" as const, icon: CloudSun },
    ],
  },
  {
    label: { en: "Knowledge", am: "እውቀት" },
    items: [
      { path: "/wisdom", key: "nav.wisdom" as const, icon: BookOpen },
      { path: "/animal-bank", key: "nav.animalBank" as const, icon: Heart },
      { path: "/forum", key: "nav.forum" as const, icon: MessageSquare },
    ],
  },
  {
    label: { en: "Market", am: "ገበያ" },
    items: [
      { path: "/marketplace", key: "nav.marketplace" as const, icon: ShoppingCart },
      { path: "/prices", key: "nav.prices" as const, icon: TrendingUp },
    ],
  },
];

const standaloneItems = [
  { path: "/dashboard", key: "nav.dashboard" as const, icon: LayoutDashboard },
  { path: "/premium", key: "nav.premium" as const, icon: Crown },
];


const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const { lang, setLang, t } = useLang();
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setIsAdmin(false); setProfileName(null); return; }
    const check = async () => {
      const { data: roleData } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }) as { data: boolean | null };
      setIsAdmin(!!roleData);
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
      setProfileName(profile?.full_name || null);
    };
    check();
  }, [user]);

  useEffect(() => {
    setOpen(false);
    setProfileOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setOpenDropdown(label);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  const userInitial = (profileName?.[0] || user?.email?.[0] || "U").toUpperCase();
  const displayName = profileName || user?.email?.split("@")[0] || "";
  const displayEmail = user?.email || "";

  const isActiveGroup = (items: typeof navGroups[0]["items"]) =>
    items.some(i => location.pathname === i.path);

  return (
    <nav className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-lg">
      <div className="container flex items-center justify-between h-14">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-heading font-bold text-lg shrink-0 group">
          <div className="w-9 h-9 rounded-lg bg-primary-foreground flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm overflow-hidden">
            <img src="/favicon.png" alt="Tena-Ersha logo" width={36} height={36} className="w-full h-full object-contain" />
          </div>
          <span className="hidden sm:inline tracking-tight">ጤና-እርሻ</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {/* Home */}
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              location.pathname === "/"
                ? "bg-primary-foreground/20 shadow-sm"
                : "hover:bg-primary-foreground/10"
            }`}
          >
            {t("nav.home")}
          </Link>

          {/* Grouped dropdowns */}
          {navGroups.map((group) => {
            const groupKey = group.label.en;
            const isOpen = openDropdown === groupKey;
            const isActive = isActiveGroup(group.items);
            return (
              <div
                key={groupKey}
                className="relative"
                onMouseEnter={() => handleDropdownEnter(groupKey)}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary-foreground/20 shadow-sm"
                      : "hover:bg-primary-foreground/10"
                  }`}
                >
                  {lang === "am" ? group.label.am : group.label.en}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="absolute left-0 top-full pt-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="w-52 rounded-xl bg-card text-card-foreground shadow-xl border border-border/50 py-1.5 backdrop-blur-sm">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const active = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3.5 py-2.5 text-sm transition-colors ${
                              active
                                ? "bg-primary/10 text-primary font-semibold"
                                : "hover:bg-muted text-foreground"
                            }`}
                          >
                            <Icon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
                            {t(item.key)}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Standalone items */}
          {standaloneItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === item.path
                    ? "bg-primary-foreground/20 shadow-sm"
                    : "hover:bg-primary-foreground/10"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t(item.key)}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                location.pathname === "/admin"
                  ? "bg-primary-foreground/20 shadow-sm"
                  : "hover:bg-primary-foreground/10"
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}
        </div>

        {/* Desktop right actions */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <button
            onClick={() => setLang(lang === "en" ? "am" : "en")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-all"
          >
            <Globe className="h-4 w-4" />
            {t("lang.switch")}
          </button>
          {user ? (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full text-sm font-medium bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-all"
              >
                <span className="w-7 h-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold">
                  {userInitial}
                </span>
                <span className="max-w-[100px] truncate">{displayName}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl bg-card text-card-foreground shadow-xl border border-border/50 py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3.5 py-3 border-b border-border">
                    <p className="text-sm font-semibold truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                  </div>
                  <button
                    onClick={() => { setProfileOpen(false); signOut(); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-destructive hover:bg-muted transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("auth.logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-all shadow-sm"
            >
              <LogIn className="h-4 w-4" />
              {t("auth.login")}
            </Link>
          )}
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setLang(lang === "en" ? "am" : "en")}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-primary-foreground/10"
          >
            <Globe className="h-4 w-4" />
            {t("lang.switch")}
          </button>
          {user ? (
            <button
              onClick={() => signOut()}
              className="p-1.5 rounded bg-primary-foreground/10"
              title={displayEmail}
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <Link to="/auth" className="p-1.5 rounded bg-primary-foreground/10">
              <LogIn className="h-4 w-4" />
            </Link>
          )}
          <button onClick={() => setOpen(!open)} className="p-1">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-primary-foreground/20 pb-2 animate-in slide-in-from-top-2 duration-200">
          {user && (
            <div className="px-4 py-3 border-b border-primary-foreground/20 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold shrink-0">
                {userInitial}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs opacity-70 truncate">{displayEmail}</p>
              </div>
            </div>
          )}
          <div className="p-2 space-y-2">
            {/* Home */}
            <Link
              to="/"
              className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === "/" ? "bg-primary-foreground/20" : "hover:bg-primary-foreground/10"
              }`}
            >
              {t("nav.home")}
            </Link>
            {/* Grouped sections */}
            {navGroups.map((group) => (
              <div key={group.label.en}>
                <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider opacity-60">
                  {lang === "am" ? group.label.am : group.label.en}
                </p>
                <div className="grid grid-cols-2 gap-px">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                          location.pathname === item.path
                            ? "bg-primary-foreground/20"
                            : "hover:bg-primary-foreground/10"
                        }`}
                      >
                        <Icon className="h-4 w-4 opacity-70" />
                        {t(item.key)}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
            {/* Standalone */}
            <div className="grid grid-cols-2 gap-px">
              {standaloneItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? "bg-primary-foreground/20"
                        : "hover:bg-primary-foreground/10"
                    }`}
                  >
                    <Icon className="h-4 w-4 opacity-70" />
                    {t(item.key)}
                  </Link>
                );
              })}
            </div>
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === "/admin"
                    ? "bg-primary-foreground/20"
                    : "hover:bg-primary-foreground/10"
                }`}
              >
                <Shield className="h-4 w-4 opacity-70" />
                Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
