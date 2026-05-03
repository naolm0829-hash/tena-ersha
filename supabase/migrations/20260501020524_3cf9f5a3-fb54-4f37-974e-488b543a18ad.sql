CREATE TABLE public.crop_calendar_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_name TEXT NOT NULL,
  crop_name_am TEXT NOT NULL,
  planting_months INTEGER[] NOT NULL DEFAULT '{}',
  harvest_months INTEGER[] NOT NULL DEFAULT '{}',
  regions TEXT[] NOT NULL DEFAULT '{}',
  tips TEXT NOT NULL DEFAULT '',
  tips_am TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crop_calendar_entries ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.validate_crop_calendar_months()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  m INTEGER;
BEGIN
  FOREACH m IN ARRAY NEW.planting_months LOOP
    IF m < 1 OR m > 12 THEN
      RAISE EXCEPTION 'Planting months must be between 1 and 12';
    END IF;
  END LOOP;

  FOREACH m IN ARRAY NEW.harvest_months LOOP
    IF m < 1 OR m > 12 THEN
      RAISE EXCEPTION 'Harvest months must be between 1 and 12';
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_crop_calendar_months_trigger
BEFORE INSERT OR UPDATE ON public.crop_calendar_entries
FOR EACH ROW
EXECUTE FUNCTION public.validate_crop_calendar_months();

CREATE TRIGGER update_crop_calendar_entries_updated_at
BEFORE UPDATE ON public.crop_calendar_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Anyone can view active crop calendar entries"
ON public.crop_calendar_entries
FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage crop calendar entries"
ON public.crop_calendar_entries
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_crop_calendar_entries_active_sort
ON public.crop_calendar_entries (is_active, sort_order, crop_name);