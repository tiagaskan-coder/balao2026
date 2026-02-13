-- Garante que a tabela existe
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

-- Garante que a coluna audio_url existe (caso a tabela já existisse sem ela)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'arena_events' AND column_name = 'audio_url') THEN
        ALTER TABLE public.arena_events ADD COLUMN audio_url text;
    END IF;
END $$;

-- Habilita RLS
ALTER TABLE public.arena_events ENABLE ROW LEVEL SECURITY;

-- Recria policies de forma segura
DROP POLICY IF EXISTS "Enable read access for all users" ON public.arena_events;
CREATE POLICY "Enable read access for all users" ON public.arena_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable write access for service role only" ON public.arena_events;
CREATE POLICY "Enable write access for service role only" ON public.arena_events FOR ALL USING (auth.role() = 'service_role');

-- Atualiza ou insere os dados com os novos GIFs e sons (Upsert)
INSERT INTO public.arena_events (id, title, message, gif_url, audio_url, duration) VALUES
    ('sale', 'NOVA VENDA!', 'Mais uma pra conta! 💸', 'https://media.giphy.com/media/l0Ex6kAKAoFRsFh6M/giphy.gif', 'https://cdn.freesound.org/previews/341/341695_5858296-lq.mp3', 5000),
    ('google', 'GOOGLE BÔNUS!', 'Dominou o Google! 🚀', 'https://media.giphy.com/media/3oKIPm3BynUpUysTHW/giphy.gif', 'https://cdn.freesound.org/previews/171/171671_2437358-lq.mp3', 5000),
    ('leader', 'NOVO LÍDER!', 'Assumiu a ponta! 👑', 'https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif', 'https://cdn.freesound.org/previews/270/270404_5123851-lq.mp3', 8000),
    ('big_sale', 'BIG SALE!!!', 'Venda GIGANTE detectada! 💰💰💰', 'https://media.giphy.com/media/vxTbZfV7T1h56/giphy.gif', 'https://cdn.freesound.org/previews/320/320653_5260872-lq.mp3', 7000),
    ('level_up', 'META BATIDA!', 'Superou 100% da meta! 🌟', 'https://media.giphy.com/media/mi6DsSSNKDbUY/giphy.gif', 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3', 6000),
    ('combo', 'COMBO BREAKER!', 'Vendas em sequência! 🔥', 'https://media.giphy.com/media/CjmvTCZf2U3p09Cn0h/giphy.gif', 'https://cdn.freesound.org/previews/270/270545_5123851-lq.mp3', 5000),
    ('global_goal', 'META GLOBAL ATINGIDA!', 'PARABÉNS TIME!!! 🎉🎉🎉', 'https://media.giphy.com/media/VuTqN2H7Vf9jK/giphy.gif', 'https://cdn.freesound.org/previews/270/270402_5123851-lq.mp3', 10000),
    ('last_mile', 'RETA FINAL!', 'Falta muito pouco! Vamos lá! 🚨', 'https://media.giphy.com/media/l0HlOaQcLJ2hHpYcw/giphy.gif', 'https://cdn.freesound.org/previews/171/171673_2437358-lq.mp3', 5000),
    ('early_bird', 'EARLY BIRD!', 'Abriu a porteira do dia! 🌅', 'https://media.giphy.com/media/Mji33Ul8s8ZWM/giphy.gif', 'https://cdn.freesound.org/previews/270/270396_5123851-lq.mp3', 5000),
    ('synergy', 'SINERGIA!', 'Vendas simultâneas! Toca aqui! ✋', 'https://media.giphy.com/media/pHb82iyFTEus3Cu52/giphy.gif', 'https://cdn.freesound.org/previews/270/270409_5123851-lq.mp3', 5000),
    ('bounty', 'NA MOSCA!', 'Valor exato! Que precisão! 🎯', 'https://media.giphy.com/media/11j6oiwfuzwu9G/giphy.gif', 'https://cdn.freesound.org/previews/320/320672_5260872-lq.mp3', 5000),
    ('ice_breaker', 'QUEBROU O GELO!', 'De volta ao jogo! 🧊🔨', 'https://media.giphy.com/media/3o7aCS5o3M7KxY3iQ8/giphy.gif', 'https://cdn.freesound.org/previews/320/320654_5260872-lq.mp3', 5000)
ON CONFLICT (id) DO UPDATE SET
    gif_url = EXCLUDED.gif_url,
    audio_url = EXCLUDED.audio_url,
    title = EXCLUDED.title,
    message = EXCLUDED.message,
    duration = EXCLUDED.duration;
