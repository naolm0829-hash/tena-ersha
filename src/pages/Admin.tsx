import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Users, MapPin, Mail, Plus, Trash2, Edit, Loader2, Sprout, BookOpen, CreditCard, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

type Tab = "disease" | "crops" | "wisdom" | "payments" | "users" | "email";

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

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: string;
}

interface CropCalendarEntry {
  id: string;
  crop_name: string;
  crop_name_am: string;
  planting_months: number[];
  harvest_months: number[];
  regions: string[];
  tips: string;
  tips_am: string;
  is_active: boolean;
  sort_order: number;
}

const Admin = () => {
  const { user } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("disease");
  const [reports, setReports] = useState<DiseaseReport[]>([]);
  const [crops, setCrops] = useState<CropCalendarEntry[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [remedies, setRemedies] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReport, setEditingReport] = useState<DiseaseReport | null>(null);
  const [editingCrop, setEditingCrop] = useState<CropCalendarEntry | null>(null);
  const [editingRemedy, setEditingRemedy] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCropForm, setShowCropForm] = useState(false);
  const [showRemedyForm, setShowRemedyForm] = useState(false);

  // Check admin
  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    const checkAdmin = async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }) as { data: boolean | null };
      setIsAdmin(!!data);
      if (!data) navigate("/");
    };
    checkAdmin();
  }, [user, navigate]);

  // Fetch data
  useEffect(() => {
    if (!isAdmin) return;
    const fetchAll = async () => {
      setLoading(true);
      const [rRes, cRes, pRes, roRes, wRes, payRes, sRes] = await Promise.all([
        supabase.from("disease_reports").select("*").order("report_count", { ascending: false }),
        supabase.from("crop_calendar_entries" as any).select("*").order("sort_order", { ascending: true }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("wisdom_remedies" as any).select("*").order("sort_order", { ascending: true }),
        supabase.from("payment_requests" as any).select("*").order("created_at", { ascending: false }),
        supabase.from("subscriptions" as any).select("*"),
      ]);
      if (rRes.data) setReports(rRes.data as unknown as DiseaseReport[]);
      if (cRes.data) setCrops(cRes.data as unknown as CropCalendarEntry[]);
      if (pRes.data) setProfiles(pRes.data as unknown as Profile[]);
      if (roRes.data) setRoles(roRes.data as unknown as UserRole[]);
      if (wRes.data) setRemedies(wRes.data as any[]);
      if (payRes.data) setPayments(payRes.data as any[]);
      if (sRes.data) setSubs(sRes.data as any[]);
      setLoading(false);
    };
    fetchAll();
  }, [isAdmin]);

  const deleteReport = async (id: string) => {
    const { error } = await supabase.from("disease_reports").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setReports((r) => r.filter((x) => x.id !== id));
    toast({ title: "Deleted" });
  };

  const toggleActive = async (id: string, active: boolean) => {
    const { error } = await supabase.from("disease_reports").update({ is_active: !active }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setReports((r) => r.map((x) => (x.id === id ? { ...x, is_active: !active } : x)));
  };

  const assignRole = async (userId: string, role: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role } as any);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setRoles((r) => [...r, { user_id: userId, role }]);
    toast({ title: `Role ${role} assigned` });
  };

  const removeRole = async (userId: string, role: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setRoles((r) => r.filter((x) => !(x.user_id === userId && x.role === role)));
    toast({ title: `Role ${role} removed` });
  };

  const deleteCrop = async (id: string) => {
    const { error } = await supabase.from("crop_calendar_entries" as any).delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setCrops((items) => items.filter((item) => item.id !== id));
    toast({ title: "Crop deleted" });
  };

  if (isAdmin === null) return (
    <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  );

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "disease", label: "Diseases", icon: MapPin },
    { id: "crops", label: "Crops", icon: Sprout },
    { id: "wisdom", label: "Wisdom", icon: BookOpen },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "users", label: "Users", icon: Users },
    { id: "email", label: "Email", icon: Mail },
  ];

  const approvePayment = async (id: string) => {
    const { error } = await supabase.from("payment_requests" as any).update({ status: "approved", reviewed_by: user!.id } as any).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setPayments((p) => p.map((x) => x.id === id ? { ...x, status: "approved" } : x));
    toast({ title: "Approved — premium activated" });
  };
  const rejectPayment = async (id: string) => {
    const { error } = await supabase.from("payment_requests" as any).update({ status: "rejected", reviewed_by: user!.id } as any).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setPayments((p) => p.map((x) => x.id === id ? { ...x, status: "rejected" } : x));
  };
  const deleteRemedy = async (id: string) => {
    const { error } = await supabase.from("wisdom_remedies" as any).delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setRemedies((r) => r.filter((x) => x.id !== id));
  };
  const grantPremium = async (uid: string) => {
    const expires = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    const { error } = await supabase.from("subscriptions" as any).upsert({ user_id: uid, status: "active", tier: "monthly", expires_at: expires } as any, { onConflict: "user_id" } as any);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setSubs((s) => [...s.filter((x) => x.user_id !== uid), { user_id: uid, status: "active", tier: "monthly", expires_at: expires }]);
    toast({ title: "Premium granted (30 days)" });
  };
  const revokePremium = async (uid: string) => {
    const { error } = await supabase.from("subscriptions" as any).update({ status: "inactive" } as any).eq("user_id", uid);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setSubs((s) => s.map((x) => x.user_id === uid ? { ...x, status: "inactive" } : x));
  };

  return (
    <div className="container py-4 sm:py-6 max-w-5xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-6">
      <div className="flex items-center gap-3">
        <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-primary shrink-0" />
        <h1 className="text-xl sm:text-2xl font-heading font-bold">Admin Dashboard</h1>
      </div>

      {/* Tabs - scrollable on mobile, grid on larger screens */}
      <div className="-mx-3 sm:mx-0 overflow-x-auto sm:overflow-visible">
        <div className="flex sm:grid sm:grid-cols-6 gap-1 bg-secondary rounded-lg p-1 mx-3 sm:mx-0 w-max sm:w-auto min-w-full">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors justify-center whitespace-nowrap ${
                tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4 shrink-0" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <>
          {/* Disease Reports Tab */}
          {tab === "disease" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{reports.length} Disease Reports</h2>
                <Button onClick={() => { setShowAddForm(true); setEditingReport(null); }} size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Report
                </Button>
              </div>

              {(showAddForm || editingReport) && (
                <DiseaseForm
                  report={editingReport}
                  onSave={async (r) => {
                    if (editingReport) {
                      const { error } = await supabase.from("disease_reports").update(r as any).eq("id", editingReport.id);
                      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
                      setReports((rr) => rr.map((x) => (x.id === editingReport.id ? { ...x, ...r } : x)));
                    } else {
                      const { data, error } = await supabase.from("disease_reports").insert(r as any).select().single();
                      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
                      setReports((rr) => [data as unknown as DiseaseReport, ...rr]);
                    }
                    setShowAddForm(false);
                    setEditingReport(null);
                    toast({ title: editingReport ? "Updated" : "Added" });
                  }}
                  onCancel={() => { setShowAddForm(false); setEditingReport(null); }}
                />
              )}

              <div className="space-y-2">
                {reports.map((r) => (
                  <div key={r.id} className={`bg-card border border-border rounded-lg p-3 flex items-center gap-3 ${!r.is_active ? "opacity-50" : ""}`}>
                    <div className={`w-3 h-3 rounded-full shrink-0 ${r.severity === "high" ? "bg-alert" : r.severity === "medium" ? "bg-accent" : "bg-success"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{r.region} — {r.disease}</div>
                      <div className="text-xs text-muted-foreground">{r.report_count} reports · {r.severity} · {r.is_active ? "Active" : "Inactive"}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => toggleActive(r.id, r.is_active)}>
                        {r.is_active ? "Disable" : "Enable"}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setEditingReport(r); setShowAddForm(false); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteReport(r.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "crops" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{crops.length} Crop Calendar Entries</h2>
                <Button onClick={() => { setShowCropForm(true); setEditingCrop(null); }} size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Crop
                </Button>
              </div>

              {(showCropForm || editingCrop) && (
                <CropForm
                  crop={editingCrop}
                  onSave={async (crop) => {
                    if (editingCrop) {
                      const { error } = await supabase.from("crop_calendar_entries" as any).update(crop as any).eq("id", editingCrop.id);
                      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
                      setCrops((items) => items.map((item) => (item.id === editingCrop.id ? { ...item, ...crop } as CropCalendarEntry : item)));
                    } else {
                      const { data, error } = await supabase.from("crop_calendar_entries" as any).insert(crop as any).select().single();
                      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
                      setCrops((items) => [...items, data as unknown as CropCalendarEntry].sort((a, b) => a.sort_order - b.sort_order));
                    }
                    setShowCropForm(false);
                    setEditingCrop(null);
                    toast({ title: editingCrop ? "Crop updated" : "Crop added" });
                  }}
                  onCancel={() => { setShowCropForm(false); setEditingCrop(null); }}
                />
              )}

              <div className="space-y-2">
                {crops.map((crop) => (
                  <div key={crop.id} className={`bg-card border border-border rounded-lg p-4 flex items-start gap-3 ${!crop.is_active ? "opacity-50" : ""}`}>
                    <Sprout className="h-5 w-5 text-success mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{crop.crop_name} — {crop.crop_name_am}</div>
                      <div className="text-xs text-muted-foreground">
                        Plant: {crop.planting_months.join(", ") || "—"} · Harvest: {crop.harvest_months.join(", ") || "Perennial"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{crop.regions.join(", ")}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingCrop(crop); setShowCropForm(false); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteCrop(crop.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "wisdom" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{remedies.length} Remedies</h2>
                <Button onClick={() => { setShowRemedyForm(true); setEditingRemedy(null); }} size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Remedy
                </Button>
              </div>
              {(showRemedyForm || editingRemedy) && (
                <RemedyForm
                  remedy={editingRemedy}
                  onSave={async (r) => {
                    if (editingRemedy) {
                      const { error } = await supabase.from("wisdom_remedies" as any).update(r as any).eq("id", editingRemedy.id);
                      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
                      setRemedies((items) => items.map((it) => it.id === editingRemedy.id ? { ...it, ...r } : it));
                    } else {
                      const { data, error } = await supabase.from("wisdom_remedies" as any).insert(r as any).select().single();
                      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
                      setRemedies((items) => [...items, data].sort((a, b) => a.sort_order - b.sort_order));
                    }
                    setShowRemedyForm(false); setEditingRemedy(null);
                    toast({ title: editingRemedy ? "Updated" : "Added" });
                  }}
                  onCancel={() => { setShowRemedyForm(false); setEditingRemedy(null); }}
                />
              )}
              <div className="space-y-2">
                {remedies.map((r) => (
                  <div key={r.id} className={`bg-card border border-border rounded-lg p-3 flex items-start gap-3 ${!r.is_active ? "opacity-50" : ""}`}>
                    <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{r.name}</div>
                      <div className="text-xs text-accent">{r.target}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{r.method}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingRemedy(r); setShowRemedyForm(false); }}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteRemedy(r.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "payments" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">{payments.length} Payment Requests</h2>
              <div className="space-y-2">
                {payments.map((p) => {
                  const profile = profiles.find((pr) => pr.id === p.user_id);
                  return (
                    <div key={p.id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{profile?.full_name || profile?.email || p.user_id.slice(0, 8)}</div>
                        <div className="text-xs text-muted-foreground">{profile?.phone} · {profile?.country}</div>
                        <div className="text-xs">Ref: <span className="font-mono">{p.reference}</span> · {p.amount} ETB · {p.tier}</div>
                        <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "approved" ? "bg-success/20 text-success" : p.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-accent/20 text-accent-foreground"}`}>{p.status}</span>
                      {p.status === "pending" && (
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => approvePayment(p.id)} className="bg-success hover:bg-success/90"><Check className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => rejectPayment(p.id)}><X className="h-4 w-4" /></Button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {payments.length === 0 && <div className="text-center py-10 text-muted-foreground">No payment requests yet.</div>}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {tab === "users" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">{profiles.length} Registered Users</h2>
              <div className="space-y-2">
                {profiles.map((p) => {
                  const userRoles = roles.filter((r) => r.user_id === p.id);
                  const sub = subs.find((s) => s.user_id === p.id);
                  const active = sub?.status === "active" && (!sub.expires_at || new Date(sub.expires_at) > new Date());
                  return (
                    <div key={p.id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 flex-wrap">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {(p.full_name || p.email || "?")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{p.full_name || "No name"}</div>
                        <div className="text-sm text-muted-foreground">{p.email}</div>
                        <div className="text-xs text-muted-foreground">{p.phone || "—"} · {p.country || "—"}</div>
                        <div className="text-xs text-muted-foreground">Joined {new Date(p.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="flex gap-1 items-center flex-wrap">
                        {active && <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">PREMIUM</span>}
                        {userRoles.map((r) => (
                          <span key={r.role} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                            {r.role}
                            <button onClick={() => removeRole(p.id, r.role)} className="hover:opacity-70">×</button>
                          </span>
                        ))}
                        {!userRoles.find((r) => r.role === "admin") && (
                          <Button variant="outline" size="sm" onClick={() => assignRole(p.id, "admin")} className="text-xs h-7">Make Admin</Button>
                        )}
                        {active ? (
                          <Button variant="outline" size="sm" onClick={() => revokePremium(p.id)} className="text-xs h-7">Revoke</Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => grantPremium(p.id)} className="text-xs h-7">Grant Premium</Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {profiles.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">No users registered yet.</div>
                )}
              </div>
            </div>
          )}

          {/* Email Tab */}
          {tab === "email" && (
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-6 text-center space-y-4">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto" />
                <h2 className="text-lg font-semibold">Email Setup Required</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  To send branded auth emails (password reset, verification) and app notifications from your own domain, 
                  you need to set up an email domain first. This improves deliverability and builds trust with your farmers.
                </p>
                <p className="text-sm text-muted-foreground">
                  Set up your sender domain below to get started.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const parseNumberList = (value: string) => value
  .split(",")
  .map((part) => Number(part.trim()))
  .filter((number) => Number.isInteger(number) && number >= 1 && number <= 12);

const parseTextList = (value: string) => value
  .split(",")
  .map((part) => part.trim())
  .filter(Boolean);

const CropForm = ({
  crop,
  onSave,
  onCancel,
}: {
  crop: CropCalendarEntry | null;
  onSave: (data: Partial<CropCalendarEntry>) => void;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState({
    crop_name: crop?.crop_name || "",
    crop_name_am: crop?.crop_name_am || "",
    planting_months: crop?.planting_months.join(", ") || "",
    harvest_months: crop?.harvest_months.join(", ") || "",
    regions: crop?.regions.join(", ") || "",
    tips: crop?.tips || "",
    tips_am: crop?.tips_am || "",
    sort_order: crop?.sort_order || 100,
    is_active: crop?.is_active ?? true,
  });

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <h3 className="font-semibold">{crop ? "Edit Crop" : "Add Crop"}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input placeholder="Crop name" value={form.crop_name} onChange={(e) => setForm({ ...form, crop_name: e.target.value })} />
        <Input placeholder="Crop name Amharic" value={form.crop_name_am} onChange={(e) => setForm({ ...form, crop_name_am: e.target.value })} />
        <Input placeholder="Planting months, e.g. 6, 7" value={form.planting_months} onChange={(e) => setForm({ ...form, planting_months: e.target.value })} />
        <Input placeholder="Harvest months, e.g. 11, 12" value={form.harvest_months} onChange={(e) => setForm({ ...form, harvest_months: e.target.value })} />
        <Input placeholder="Regions, comma separated" value={form.regions} onChange={(e) => setForm({ ...form, regions: e.target.value })} />
        <Input type="number" placeholder="Sort order" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
        <Textarea className="sm:col-span-2" placeholder="Tips" value={form.tips} onChange={(e) => setForm({ ...form, tips: e.target.value })} />
        <Textarea className="sm:col-span-2" placeholder="Tips Amharic" value={form.tips_am} onChange={(e) => setForm({ ...form, tips_am: e.target.value })} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
        Active
      </label>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={() => onSave({
          crop_name: form.crop_name,
          crop_name_am: form.crop_name_am,
          planting_months: parseNumberList(form.planting_months),
          harvest_months: parseNumberList(form.harvest_months),
          regions: parseTextList(form.regions),
          tips: form.tips,
          tips_am: form.tips_am,
          sort_order: form.sort_order,
          is_active: form.is_active,
        })}>
          {crop ? "Update" : "Add"}
        </Button>
      </div>
    </div>
  );
};

// Disease report form component
const DiseaseForm = ({
  report,
  onSave,
  onCancel,
}: {
  report: DiseaseReport | null;
  onSave: (data: Partial<DiseaseReport>) => void;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState({
    region: report?.region || "",
    region_am: report?.region_am || "",
    disease: report?.disease || "",
    disease_am: report?.disease_am || "",
    severity: report?.severity || "medium",
    report_count: report?.report_count || 1,
    latitude: report?.latitude || 9,
    longitude: report?.longitude || 38,
    is_active: report?.is_active ?? true,
  });

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <h3 className="font-semibold">{report ? "Edit Report" : "Add New Report"}</h3>
      <div className="grid grid-cols-2 gap-3">
        <Input placeholder="Region (English)" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
        <Input placeholder="Region (Amharic)" value={form.region_am} onChange={(e) => setForm({ ...form, region_am: e.target.value })} />
        <Input placeholder="Disease (English)" value={form.disease} onChange={(e) => setForm({ ...form, disease: e.target.value })} />
        <Input placeholder="Disease (Amharic)" value={form.disease_am} onChange={(e) => setForm({ ...form, disease_am: e.target.value })} />
        <select
          value={form.severity}
          onChange={(e) => setForm({ ...form, severity: e.target.value })}
          className="px-3 py-2 rounded-md bg-background border border-input text-sm"
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <Input type="number" placeholder="Report count" value={form.report_count} onChange={(e) => setForm({ ...form, report_count: Number(e.target.value) })} />
        <Input type="number" step="0.1" placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: Number(e.target.value) })} />
        <Input type="number" step="0.1" placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: Number(e.target.value) })} />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={() => onSave(form)}>
          {report ? "Update" : "Add"}
        </Button>
      </div>
    </div>
  );
};

export default Admin;

const RemedyForm = ({ remedy, onSave, onCancel }: { remedy: any; onSave: (d: any) => void; onCancel: () => void; }) => {
  const [form, setForm] = useState({
    name: remedy?.name || "",
    target: remedy?.target || "",
    method: remedy?.method || "",
    category: remedy?.category || "plant",
    sort_order: remedy?.sort_order ?? 100,
    is_active: remedy?.is_active ?? true,
  });
  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <h3 className="font-semibold">{remedy ? "Edit Remedy" : "Add Remedy"}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input placeholder="Target (e.g. Aphids on tomato)" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="px-3 py-2 rounded-md bg-background border border-input text-sm">
          <option value="plant">Plant</option>
          <option value="animal">Animal</option>
        </select>
        <Input type="number" placeholder="Sort order" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
        <Textarea className="sm:col-span-2" placeholder="Method / instructions" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
        Active
      </label>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={() => onSave(form)}>{remedy ? "Update" : "Add"}</Button>
      </div>
    </div>
  );
};
