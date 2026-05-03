
-- Create animal health records table
CREATE TABLE public.animal_health_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  animal_name TEXT NOT NULL,
  animal_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'sick', 'recovering')),
  notes TEXT,
  last_checkup DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.animal_health_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own animals" ON public.animal_health_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own animals" ON public.animal_health_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own animals" ON public.animal_health_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own animals" ON public.animal_health_records FOR DELETE USING (auth.uid() = user_id);

-- Create AI diagnoses table
CREATE TABLE public.ai_diagnoses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT,
  diagnosis_name TEXT NOT NULL,
  confidence NUMERIC NOT NULL,
  advice TEXT NOT NULL,
  scan_type TEXT NOT NULL DEFAULT 'plant' CHECK (scan_type IN ('plant', 'animal')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_diagnoses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own diagnoses" ON public.ai_diagnoses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own diagnoses" ON public.ai_diagnoses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_animal_health_updated_at
  BEFORE UPDATE ON public.animal_health_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
