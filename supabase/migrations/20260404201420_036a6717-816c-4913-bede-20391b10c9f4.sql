
CREATE TABLE public.disease_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL,
  region_am text NOT NULL,
  disease text NOT NULL,
  disease_am text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  report_count integer NOT NULL DEFAULT 1,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  reported_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.disease_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view disease reports"
ON public.disease_reports FOR SELECT
TO public
USING (true);

INSERT INTO public.disease_reports (region, region_am, disease, disease_am, severity, report_count, latitude, longitude) VALUES
('Oromia', 'ኦሮሚያ', 'Fall Armyworm', 'ፎል አርሚወርም', 'high', 142, 7.5, 39.5),
('Amhara', 'አማራ', 'Newcastle Disease', 'ኒውካስል በሽታ', 'high', 89, 11.5, 38.5),
('Tigray', 'ትግራይ', 'Tomato Leaf Curl', 'የቲማቲም ቅጠል ቫይረስ', 'medium', 56, 13.5, 39.0),
('SNNPR', 'ደቡብ', 'Lumpy Skin Disease', 'ላምፒ ስኪን ዲዚዝ', 'high', 73, 6.5, 37.5),
('Sidama', 'ሲዳማ', 'Coffee Berry Disease', 'የቡና ፍሬ በሽታ', 'medium', 34, 6.8, 38.4),
('Afar', 'አፋር', 'Camel Pox', 'የግመል ፈንጣጣ', 'low', 12, 11.5, 41.0),
('Somali', 'ሶማሊ', 'Rift Valley Fever', 'ሪፍት ቫሊ ትኩሳት', 'medium', 28, 6.0, 44.0),
('Harari', 'ሐረሪ', 'Teff Shoot Fly', 'የጤፍ ተባይ', 'low', 15, 9.3, 42.1),
('Gambella', 'ጋምቤላ', 'Maize Streak Virus', 'የበቆሎ ቫይረስ', 'medium', 41, 8.0, 34.5),
('Benishangul-Gumuz', 'ቤንሻንጉል ጉሙዝ', 'Wheat Rust', 'የስንዴ ዝገት', 'high', 67, 10.5, 35.5),
('Dire Dawa', 'ድሬ ዳዋ', 'Foot and Mouth Disease', 'የእግር እና አፍ በሽታ', 'low', 9, 9.6, 41.8),
('Addis Ababa', 'አዲስ አበባ', 'Avian Influenza', 'የወፍ ጉንፋን', 'low', 5, 9.0, 38.7);
