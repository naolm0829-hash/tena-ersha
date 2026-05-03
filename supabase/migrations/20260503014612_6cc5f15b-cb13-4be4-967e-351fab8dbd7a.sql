
-- Profiles: add phone + country
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS country text;

-- Update signup handler to capture name/phone/country from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, country)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'country'
  );
  RETURN NEW;
END;
$$;

-- Ensure auth trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'inactive',
  tier text NOT NULL DEFAULT 'monthly',
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own subscription" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage subscriptions" ON public.subscriptions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- is_premium helper
CREATE OR REPLACE FUNCTION public.is_premium(_user uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = _user
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Payment requests (Telebirr manual)
CREATE TABLE IF NOT EXISTS public.payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tier text NOT NULL DEFAULT 'monthly',
  amount numeric NOT NULL,
  method text NOT NULL DEFAULT 'telebirr',
  reference text,
  phone text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid
);
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users create own payment requests" ON public.payment_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own or admin all" ON public.payment_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update payment requests" ON public.payment_requests
  FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete payment requests" ON public.payment_requests
  FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

-- Auto-activate subscription when admin approves a payment request
CREATE OR REPLACE FUNCTION public.handle_payment_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  duration interval;
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    duration := CASE WHEN NEW.tier = 'yearly' THEN interval '365 days' ELSE interval '30 days' END;
    INSERT INTO public.subscriptions (user_id, status, tier, expires_at)
    VALUES (NEW.user_id, 'active', NEW.tier, now() + duration)
    ON CONFLICT (user_id) DO UPDATE
      SET status = 'active',
          tier = EXCLUDED.tier,
          expires_at = GREATEST(COALESCE(public.subscriptions.expires_at, now()), now()) + duration,
          updated_at = now();
    NEW.reviewed_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS payment_approval_trigger ON public.payment_requests;
CREATE TRIGGER payment_approval_trigger
  BEFORE UPDATE ON public.payment_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_payment_approval();

-- Wisdom remedies table
CREATE TABLE IF NOT EXISTS public.wisdom_remedies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  target text NOT NULL,
  method text NOT NULL,
  category text NOT NULL DEFAULT 'plant',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.wisdom_remedies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view active remedies" ON public.wisdom_remedies
  FOR SELECT USING (is_active = true OR has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage remedies" ON public.wisdom_remedies
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TRIGGER update_wisdom_remedies_updated_at
  BEFORE UPDATE ON public.wisdom_remedies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
