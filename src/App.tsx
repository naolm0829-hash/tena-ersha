import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LangProvider } from "./contexts/LangContext";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import DiseaseAlertTicker from "./components/DiseaseAlertTicker";
import Footer from "./components/Footer";
import PremiumGate from "./components/PremiumGate";
import Index from "./pages/Index";
import AIScan from "./pages/AIScan";
import Heatmap from "./pages/Heatmap";
import SmartInputs from "./pages/SmartInputs";
import WisdomWiki from "./pages/WisdomWiki";
import AnimalBank from "./pages/AnimalBank";
import Premium from "./pages/Premium";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Weather from "./pages/Weather";
import Forum from "./pages/Forum";
import Marketplace from "./pages/Marketplace";
import CropCalendar from "./pages/CropCalendar";
import PriceTracker from "./pages/PriceTracker";
import Dashboard from "./pages/Dashboard";
import ToolRentals from "./pages/ToolRentals";
import MyTools from "./pages/MyTools";
import ToolByQR from "./pages/ToolByQR";
import SpareParts from "./pages/SpareParts";
import ToolCalculator from "./pages/ToolCalculator";
import Operators from "./pages/Operators";
import BulkRequests from "./pages/BulkRequests";
import SavedSearches from "./pages/SavedSearches";
import Escrow from "./pages/Escrow";
import PriceTrends from "./pages/PriceTrends";
import BecomeVerified from "./pages/BecomeVerified";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LangProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <DiseaseAlertTicker />
            <Navbar />
            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/scan" element={<PremiumGate label="AI Scan Center"><AIScan /></PremiumGate>} />
                <Route path="/heatmap" element={<Heatmap />} />
                <Route path="/inputs" element={<PremiumGate label="Smart Inputs"><SmartInputs /></PremiumGate>} />
                <Route path="/wisdom" element={<WisdomWiki />} />
                <Route path="/animal-bank" element={<PremiumGate label="Animal Bank"><AnimalBank /></PremiumGate>} />
                <Route path="/premium" element={<Premium />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/weather" element={<Weather />} />
                <Route path="/forum" element={<Forum />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/crop-calendar" element={<CropCalendar />} />
                <Route path="/prices" element={<PriceTracker />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/rentals" element={<ToolRentals />} />
                <Route path="/my-tools" element={<MyTools />} />
                <Route path="/tool/:code" element={<ToolByQR />} />
                <Route path="/parts" element={<SpareParts />} />
                <Route path="/tool-calculator" element={<ToolCalculator />} />
                <Route path="/operators" element={<Operators />} />
                <Route path="/bulk-requests" element={<BulkRequests />} />
                <Route path="/saved-searches" element={<SavedSearches />} />
                <Route path="/escrow" element={<Escrow />} />
                <Route path="/price-trends" element={<PriceTrends />} />
                <Route path="/become-verified" element={<BecomeVerified />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LangProvider>
  </QueryClientProvider>
);

export default App;
