-- Create arena_events table
CREATE TABLE IF NOT EXISTS public.arena_events (
    id text PRIMARY KEY,
    title text NOT NULL,
    message text NOT NULL,
    gif_url text NOT NULL,
    audio_url text,
    duration integer NOT NULL DEFAULT 5000,
    active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.arena_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.arena_events
    FOR SELECT USING (true);

CREATE POLICY "Enable write access for service role only" ON public.arena_events
    FOR ALL USING (auth.role() = 'service_role');

-- Insert default data
INSERT INTO public.arena_events (id, title, message, gif_url, audio_url, duration) VALUES
    ('leader', 'NOVO LÍDER!', 'Assumiu a ponta! 👑', 'https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif', 'https://cdn.freesound.org/previews/270/270404_5123851-lq.mp3', 8000)
ON CONFLICT (id) DO NOTHING;
