import { useEffect, useState } from "react";
import { Plus, MapPin, Phone, Wrench, X, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import ImageUpload from "@/components/ImageUpload";

const cats = ["tractor","plow","sprayer","harvester","irrigation","other"];

interface Rental { id:string; owner_id:string; name:string; category:string; description:string|null; price_per_day:number; price_per_hour:number|null; location:string|null; contact:string|null; image_url:string|null; is_available:boolean; }

export default function ToolRentals() {
  const { user } = useAuth();
  const { lang } = useLang();
  const [items,setItems]=useState<Rental[]>([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [filter,setFilter]=useState("all");
  const [form,setForm]=useState({name:"",category:"tractor",description:"",price_per_day:"",price_per_hour:"",location:"",contact:"",image_url:""});
  const [bookingId,setBookingId]=useState<string|null>(null);
  const [book,setBook]=useState({start_date:"",end_date:"",notes:""});

  const load=async()=>{
    const { data } = await supabase.from("tool_rentals").select("*").order("created_at",{ascending:false});
    setItems((data as Rental[])||[]); setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const create=async()=>{
    if(!user||!form.name) return;
    const { error } = await supabase.from("tool_rentals").insert({ owner_id:user.id, name:form.name, category:form.category, description:form.description||null, price_per_day:Number(form.price_per_day)||0, price_per_hour:form.price_per_hour?Number(form.price_per_hour):null, location:form.location||null, contact:form.contact||null, image_url:form.image_url||null });
    if(error){ toast.error(error.message); return; }
    toast.success("Listed!"); setShowForm(false); setForm({name:"",category:"tractor",description:"",price_per_day:"",price_per_hour:"",location:"",contact:"",image_url:""}); load();
  };
  const del=async(id:string)=>{ await supabase.from("tool_rentals").delete().eq("id",id); load(); };

  const submitBooking=async()=>{
    if(!user||!bookingId||!book.start_date||!book.end_date) return;
    const { error } = await supabase.from("rental_bookings").insert({ rental_id:bookingId, renter_id:user.id, start_date:book.start_date, end_date:book.end_date, notes:book.notes||null });
    if(error){ toast.error(error.message); return; }
    toast.success(lang==="am"?"ጠይቀዋል":"Booking requested"); setBookingId(null); setBook({start_date:"",end_date:"",notes:""});
  };

  const filtered = filter==="all"?items:items.filter(i=>i.category===filter);

  return (
    <div className="container py-8 space-y-6">
      <div className="text-center"><h1 className="text-3xl font-heading font-bold text-primary">🚜 {lang==="am"?"የመሳሪያ ኪራይ":"Tool Rentals"}</h1>
        <p className="text-muted-foreground text-sm">{lang==="am"?"ትራክተር፣ ማረሻ፣ ስፕሬየር በቀን ይከራዩ":"Rent tractors, plows & sprayers by day or hour"}</p></div>

      <div className="flex flex-wrap gap-2 justify-center">
        <button onClick={()=>setFilter("all")} className={`px-3 py-1 rounded-full text-xs font-medium ${filter==="all"?"bg-primary text-primary-foreground":"bg-muted"}`}>All</button>
        {cats.map(c=><button key={c} onClick={()=>setFilter(c)} className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${filter===c?"bg-primary text-primary-foreground":"bg-muted"}`}>{c}</button>)}
      </div>

      {user ? (
        <button onClick={()=>setShowForm(!showForm)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl"><Plus className="h-5 w-5"/> {lang==="am"?"መሳሪያ ለኪራይ ይጨምሩ":"List a tool"}</button>
      ) : <Link to="/auth" className="block text-center text-sm text-primary underline">Login to list</Link>}

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Tool name (e.g. John Deere 5050D)" className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
          <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-background">{cats.map(c=><option key={c} value={c}>{c}</option>)}</select>
          <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Description" rows={2} className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={form.price_per_day} onChange={e=>setForm({...form,price_per_day:e.target.value})} placeholder="Price/day (ETB)" className="border rounded-lg px-3 py-2 text-sm bg-background"/>
            <input type="number" value={form.price_per_hour} onChange={e=>setForm({...form,price_per_hour:e.target.value})} placeholder="Price/hour" className="border rounded-lg px-3 py-2 text-sm bg-background"/>
          </div>
          <input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Location" className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
          <input value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} placeholder="Phone" className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
          <ImageUpload folder="rentals" onUpload={url=>setForm({...form,image_url:url})}/>
          <button onClick={create} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Post</button>
        </div>
      )}

      {loading ? <p className="text-center text-muted-foreground">Loading...</p> :
       filtered.length===0 ? <p className="text-center text-muted-foreground py-8">No tools available yet.</p> :
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
         {filtered.map(it=>(
           <div key={it.id} className="bg-card border border-border rounded-xl p-5 space-y-3 relative">
             {user?.id===it.owner_id && <button onClick={()=>del(it.id)} className="absolute top-3 right-3 p-1 rounded-full bg-destructive/10 text-destructive"><X className="h-4 w-4"/></button>}
             {it.image_url && <img src={it.image_url} alt={it.name} className="w-full h-40 object-cover rounded-lg"/>}
             <div className="flex items-center gap-2"><Wrench className="h-4 w-4 text-primary"/><span className="text-xs uppercase font-semibold text-primary">{it.category}</span></div>
             <h3 className="font-bold text-lg">{it.name}</h3>
             {it.description && <p className="text-sm text-muted-foreground">{it.description}</p>}
             <p className="text-lg font-bold text-primary">{it.price_per_day} ETB/day{it.price_per_hour?` · ${it.price_per_hour}/hr`:""}</p>
             {it.location && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3"/>{it.location}</p>}
             {it.contact && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3"/>{it.contact}</p>}
             {user && user.id!==it.owner_id && <button onClick={()=>setBookingId(it.id)} className="w-full px-3 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2"><Calendar className="h-4 w-4"/>Book</button>}
           </div>
         ))}
       </div>}

      {bookingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={()=>setBookingId(null)}>
          <div className="bg-card rounded-xl p-6 w-full max-w-sm space-y-3" onClick={e=>e.stopPropagation()}>
            <h3 className="font-bold">Request Booking</h3>
            <input type="date" value={book.start_date} onChange={e=>setBook({...book,start_date:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
            <input type="date" value={book.end_date} onChange={e=>setBook({...book,end_date:e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
            <textarea value={book.notes} onChange={e=>setBook({...book,notes:e.target.value})} placeholder="Notes (optional)" rows={2} className="w-full border rounded-lg px-3 py-2 text-sm bg-background"/>
            <button onClick={submitBooking} className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Send Request</button>
          </div>
        </div>
      )}
    </div>
  );
}
