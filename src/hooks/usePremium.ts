import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const usePremium = () => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setIsPremium(false); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("is_premium" as any, { _user: user.id });
      if (!cancelled) {
        setIsPremium(error ? false : !!data);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  return { isPremium: !!isPremium, loading };
};
