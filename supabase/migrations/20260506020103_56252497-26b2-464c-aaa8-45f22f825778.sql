
-- ============== FARM TOOLS ==============

-- 1) Tool rental listings
CREATE TABLE public.tool_rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'tractor',
  description TEXT,
  price_per_day NUMERIC NOT NULL DEFAULT 0,
  price_per_hour NUMERIC,
  location TEXT,
  contact TEXT,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tool_rentals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view rentals" ON public.tool_rentals FOR SELECT USING (true);
CREATE POLICY "Owners insert rentals" ON public.tool_rentals FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update rentals" ON public.tool_rentals FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners delete rentals" ON public.tool_rentals FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- 2) Rental bookings
CREATE TABLE public.rental_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id UUID NOT NULL REFERENCES public.tool_rentals(id) ON DELETE CASCADE,
  renter_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rental_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Renter or owner view bookings" ON public.rental_bookings FOR SELECT TO authenticated
  USING (auth.uid() = renter_id OR auth.uid() IN (SELECT owner_id FROM public.tool_rentals WHERE id = rental_id) OR has_role(auth.uid(),'admin'));
CREATE POLICY "Renter create booking" ON public.rental_bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = renter_id);
CREATE POLICY "Owner update booking" ON public.rental_bookings FOR UPDATE TO authenticated
  USING (auth.uid() IN (SELECT owner_id FROM public.tool_rentals WHERE id = rental_id) OR auth.uid() = renter_id);

-- 3) Owned tools (for maintenance + QR tags)
CREATE TABLE public.owned_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'tractor',
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  manual_url TEXT,
  notes TEXT,
  qr_code TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.owned_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage tools" ON public.owned_tools FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Anyone view by qr" ON public.owned_tools FOR SELECT USING (true);

-- 4) Maintenance log
CREATE TABLE public.tool_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES public.owned_tools(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  service_date DATE NOT NULL DEFAULT CURRENT_DATE,
  service_type TEXT NOT NULL,
  cost NUMERIC NOT NULL DEFAULT 0,
  fuel_liters NUMERIC,
  hours_used NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tool_maintenance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage maintenance" ON public.tool_maintenance FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Anyone view tool history" ON public.tool_maintenance FOR SELECT USING (true);

-- 5) Spare parts listings
CREATE TABLE public.spare_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  name TEXT NOT NULL,
  fits TEXT,
  category TEXT NOT NULL DEFAULT 'filter',
  price NUMERIC NOT NULL DEFAULT 0,
  location TEXT,
  contact TEXT,
  image_url TEXT,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view parts" ON public.spare_parts FOR SELECT USING (true);
CREATE POLICY "Seller insert part" ON public.spare_parts FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Seller update part" ON public.spare_parts FOR UPDATE TO authenticated USING (auth.uid() = seller_id);
CREATE POLICY "Seller delete part" ON public.spare_parts FOR DELETE TO authenticated USING (auth.uid() = seller_id);

-- 6) Operator hire board
CREATE TABLE public.operator_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  skills TEXT[] NOT NULL DEFAULT '{}',
  experience_years INTEGER NOT NULL DEFAULT 0,
  rate_per_day NUMERIC NOT NULL DEFAULT 0,
  location TEXT,
  contact TEXT,
  bio TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.operator_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view operators" ON public.operator_listings FOR SELECT USING (true);
CREATE POLICY "User manage own operator" ON public.operator_listings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============== MARKET ==============

-- 7) Bulk buyer requests
CREATE TABLE public.bulk_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL,
  crop TEXT NOT NULL,
  quantity_quintals NUMERIC NOT NULL,
  max_price_per_quintal NUMERIC,
  region TEXT,
  needed_by DATE,
  contact TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bulk_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view bulk requests" ON public.bulk_requests FOR SELECT USING (true);
CREATE POLICY "Buyer create request" ON public.bulk_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Buyer update request" ON public.bulk_requests FOR UPDATE TO authenticated USING (auth.uid() = buyer_id);
CREATE POLICY "Buyer delete request" ON public.bulk_requests FOR DELETE TO authenticated USING (auth.uid() = buyer_id);

-- 8) Verified seller status
CREATE TABLE public.seller_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  reviewed_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.seller_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view verifications" ON public.seller_verifications FOR SELECT USING (true);
CREATE POLICY "User request verification" ON public.seller_verifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin manage verifications" ON public.seller_verifications FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admin delete verifications" ON public.seller_verifications FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

-- 9) Listing reviews / ratings
CREATE TABLE public.listing_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(listing_id, reviewer_id)
);
ALTER TABLE public.listing_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view reviews" ON public.listing_reviews FOR SELECT USING (true);
CREATE POLICY "Reviewer create" ON public.listing_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id AND auth.uid() <> seller_id);
CREATE POLICY "Reviewer update" ON public.listing_reviews FOR UPDATE TO authenticated USING (auth.uid() = reviewer_id);
CREATE POLICY "Reviewer delete" ON public.listing_reviews FOR DELETE TO authenticated USING (auth.uid() = reviewer_id);

-- 10) Saved searches
CREATE TABLE public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  label TEXT NOT NULL,
  category TEXT,
  region TEXT,
  max_price NUMERIC,
  keywords TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User manage saved searches" ON public.saved_searches FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 11) Escrow transactions
CREATE TABLE public.escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE SET NULL,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  telebirr_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  buyer_confirmed BOOLEAN NOT NULL DEFAULT false,
  seller_confirmed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  released_at TIMESTAMPTZ
);
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parties view escrow" ON public.escrow_transactions FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR has_role(auth.uid(),'admin'));
CREATE POLICY "Buyer create escrow" ON public.escrow_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Parties update escrow" ON public.escrow_transactions FOR UPDATE TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR has_role(auth.uid(),'admin'));

-- updated_at triggers
CREATE TRIGGER trg_tool_rentals_updated BEFORE UPDATE ON public.tool_rentals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_owned_tools_updated BEFORE UPDATE ON public.owned_tools FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
