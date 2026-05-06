import { useState, useEffect } from "react";
import { Plus, MapPin, Phone, Tag, X, BadgeCheck, Star } from "lucide-react";
import { useLang } from "@/contexts/LangContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import ReportButton from "@/components/ReportButton";
import ImageUpload from "@/components/ImageUpload";

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  location: string | null;
  contact: string | null;
  image_url: string | null;
  status: string;
  created_at: string;
  user_id: string;
  profiles?: { full_name: string | null; email: string | null } | null;
}

const marketCategories = [
  { value: "crops", en: "Crops", am: "ሰብል" },
  { value: "livestock", en: "Livestock", am: "እንስሳ" },
  { value: "seeds", en: "Seeds", am: "ዘር" },
  { value: "tools", en: "Tools", am: "መሳሪያ" },
  { value: "feed", en: "Feed", am: "መኖ" },
  { value: "other", en: "Other", am: "ሌላ" },
];

const Marketplace = () => {
  const { lang } = useLang();
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [verified, setVerified] = useState<Set<string>>(new Set());
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({});
  const [reviewFor, setReviewFor] = useState<Listing | null>(null);
  const [revForm, setRevForm] = useState({ rating: 5, comment: "" });
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Form state
  const [form, setForm] = useState({ title: "", description: "", price: "", category: "crops", location: "", contact: "", image_url: "" });

  const fetchListings = async () => {
    const { data } = await supabase
      .from("marketplace_listings")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });
    const list = (data || []) as Listing[];
    setListings(list);
    const sellerIds = Array.from(new Set(list.map(l => l.user_id)));
    if (sellerIds.length) {
      const { data: vs } = await supabase.from("seller_verifications").select("user_id").in("user_id", sellerIds).eq("status", "approved");
      setVerified(new Set((vs || []).map((v: any) => v.user_id)));
    }
    const listingIds = list.map(l => l.id);
    if (listingIds.length) {
      const { data: rs } = await supabase.from("listing_reviews").select("listing_id,rating").in("listing_id", listingIds);
      const map: Record<string, { avg: number; count: number }> = {};
      (rs || []).forEach((r: any) => {
        map[r.listing_id] = map[r.listing_id] || { avg: 0, count: 0 };
        map[r.listing_id].avg += r.rating; map[r.listing_id].count += 1;
      });
      Object.keys(map).forEach(k => { map[k].avg = map[k].avg / map[k].count; });
      setRatings(map);
    }
    setLoading(false);
  };

  const submitReview = async () => {
    if (!user || !reviewFor) return;
    const { error } = await supabase.from("listing_reviews").insert({
      listing_id: reviewFor.id, seller_id: reviewFor.user_id, reviewer_id: user.id,
      rating: revForm.rating, comment: revForm.comment || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success(lang === "am" ? "ምስጋና" : "Review posted");
    setReviewFor(null); setRevForm({ rating: 5, comment: "" }); fetchListings();
  };

  useEffect(() => { fetchListings(); }, []);

  const createListing = async () => {
    if (!user || !form.title.trim()) return;
    const { error } = await supabase.from("marketplace_listings").insert({
      user_id: user.id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      price: parseFloat(form.price) || 0,
      category: form.category,
      location: form.location.trim() || null,
      contact: form.contact.trim() || null,
      image_url: form.image_url || null,
    });
    if (error) { toast.error(error.message); return; }
    setForm({ title: "", description: "", price: "", category: "crops", location: "", contact: "", image_url: "" });
    setShowForm(false);
    fetchListings();
    toast.success(lang === "am" ? "ዝርዝር ተጨምሯል!" : "Listing created!");
  };

  const deleteListing = async (id: string) => {
    await supabase.from("marketplace_listings").delete().eq("id", id);
    fetchListings();
    toast.success(lang === "am" ? "ተሰርዟል" : "Deleted");
  };

  const filtered = filter === "all" ? listings : listings.filter((l) => l.category === filter);

  return (
    <div className="container py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-heading font-bold text-primary">
          🛒 {lang === "am" ? "የገበያ ቦታ" : "Marketplace"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "am" ? "ሰብል ፣ እንስሳ ፣ ዘር — ይሽጡ ይግዙ" : "Buy & sell crops, livestock, seeds & more"}
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {lang === "am" ? "ሁሉም" : "All"}
        </button>
        {marketCategories.map((c) => (
          <button
            key={c.value}
            onClick={() => setFilter(c.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              filter === c.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {lang === "am" ? c.am : c.en}
          </button>
        ))}
      </div>

      {/* Add listing */}
      {user && (
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-medium"
        >
          <Plus className="h-5 w-5" />
          {lang === "am" ? "ዝርዝር ያክሉ" : "Add Listing"}
        </button>
      )}

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
          >
            {marketCategories.map((c) => (
              <option key={c.value} value={c.value}>{lang === "am" ? c.am : c.en}</option>
            ))}
          </select>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder={lang === "am" ? "ምን ይሸጣሉ?" : "What are you selling?"}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder={lang === "am" ? "ዝርዝር መግለጫ" : "Description"}
            rows={3}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background resize-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder={lang === "am" ? "ዋጋ (ብር)" : "Price (ETB)"}
              type="number"
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
            />
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder={lang === "am" ? "አካባቢ" : "Location"}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
            />
          </div>
          <input
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            placeholder={lang === "am" ? "ስልክ ቁጥር" : "Phone number"}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
          />
          <ImageUpload folder="marketplace" onUpload={(url) => setForm({ ...form, image_url: url })} />
          <button onClick={createListing} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
            {lang === "am" ? "ለጥፍ" : "Post Listing"}
          </button>
        </div>
      )}

      {/* Listings grid */}
      {loading ? (
        <p className="text-center text-muted-foreground py-8">{lang === "am" ? "እየጫነ..." : "Loading..."}</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          {lang === "am" ? "ገና ዝርዝር የለም" : "No listings yet. Be the first!"}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-xl p-5 space-y-3 relative">
              {user?.id === item.user_id && (
                <button
                  onClick={() => deleteListing(item.id)}
                  className="absolute top-3 right-3 p-1 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {item.image_url && (
                <img src={item.image_url} alt={item.title} className="w-full h-40 object-cover rounded-lg" />
              )}
              <div className="flex items-center justify-between">
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {marketCategories.find((c) => c.value === item.category)?.[lang === "am" ? "am" : "en"]}
                </span>
                <ReportButton targetType="marketplace_listing" targetId={item.id} />
              </div>
              <h3 className="font-bold text-lg flex items-center gap-1">
                {item.title}
                {verified.has(item.user_id) && <BadgeCheck className="h-4 w-4 text-blue-500" aria-label="Verified seller"/>}
              </h3>
              {ratings[item.id] && (
                <div className="flex items-center gap-1 text-xs">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400"/>
                  <b>{ratings[item.id].avg.toFixed(1)}</b>
                  <span className="text-muted-foreground">({ratings[item.id].count})</span>
                </div>
              )}
              {item.description && <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>}
              <div className="flex items-center gap-1 text-lg font-bold text-primary">
                <Tag className="h-4 w-4" />
                {item.price.toLocaleString()} ETB
              </div>
              {item.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {item.location}
                </div>
              )}
              {item.contact && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" /> {item.contact}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {item.profiles?.full_name || item.profiles?.email?.split("@")[0]} · {new Date(item.created_at).toLocaleDateString()}
              </p>
              {user && user.id !== item.user_id && (
                <button onClick={() => setReviewFor(item)} className="text-xs text-primary hover:underline">
                  {lang === "am" ? "ምስጋና ይስጡ" : "Leave a review"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!user && (
        <Link to="/auth" className="block text-center text-sm text-primary hover:underline">
          {lang === "am" ? "ለመሸጥ ይግቡ" : "Log in to sell"}
        </Link>
      )}

      {reviewFor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setReviewFor(null)}>
          <div className="bg-card rounded-xl p-6 w-full max-w-sm space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold">Review: {reviewFor.title}</h3>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setRevForm({ ...revForm, rating: n })}>
                  <Star className={`h-7 w-7 ${n <= revForm.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}/>
                </button>
              ))}
            </div>
            <textarea value={revForm.comment} onChange={(e) => setRevForm({ ...revForm, comment: e.target.value })} placeholder="Your experience" rows={3} className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
            <button onClick={submitReview} className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Submit</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
