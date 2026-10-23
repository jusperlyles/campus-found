CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('lost','found')),
  category TEXT NOT NULL,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  location TEXT NOT NULL CHECK (char_length(location) BETWEEN 1 AND 160),
  item_date DATE NOT NULL,
  description TEXT CHECK (char_length(description) <= 1000),
  phone TEXT NOT NULL CHECK (phone ~ '^0[0-9]{9}$'),
  photo_url TEXT,
  audio_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.items TO anon, authenticated;
GRANT ALL ON public.items TO service_role;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view items" ON public.items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can report items" ON public.items FOR INSERT TO anon, authenticated WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.items;

CREATE POLICY "Anyone can upload item media" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'item-media');
CREATE POLICY "Anyone can view item media" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'item-media');