import { ReactNode } from "react";
import { Crown, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { usePremium } from "@/hooks/usePremium";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export const PremiumGate = ({ children, label = "Premium feature" }: { children: ReactNode; label?: string }) => {
  const { user } = useAuth();
  const { isPremium, loading } = usePremium();

  if (loading) return <div className="container py-16 text-center text-muted-foreground">Checking access…</div>;
  if (!user) {
    return (
      <div className="container py-16 max-w-md mx-auto text-center space-y-4">
        <Lock className="h-10 w-10 mx-auto text-muted-foreground" />
        <p>Please log in to continue.</p>
        <Link to="/auth" className="inline-block px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium">Log In</Link>
      </div>
    );
  }
  if (!isPremium) {
    return (
      <div className="container py-16 max-w-md mx-auto text-center space-y-4">
        <Crown className="h-12 w-12 mx-auto text-accent" />
        <h2 className="text-xl font-heading font-bold">{label}</h2>
        <p className="text-muted-foreground">This feature is part of Tena-Ersha Premium.</p>
        <Button asChild><Link to="/premium">Upgrade to Premium</Link></Button>
      </div>
    );
  }
  return <>{children}</>;
};

export default PremiumGate;
