
-- Tabela de Vendedores (se não existir)
CREATE TABLE IF NOT EXISTS public.vendedores (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nome text NOT NULL,
    avatar_url text,
    meta_valor numeric,
    criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Conquistas (se não existir)
CREATE TABLE IF NOT EXISTS public.conquistas (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nome text NOT NULL,
    descricao text NOT NULL,
    icone_url text NOT NULL,
    xp_valor integer NOT NULL DEFAULT 0,
    tipo text CHECK (tipo IN ('automatico', 'manual')) DEFAULT 'manual',
    criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Vinculação Vendedor <-> Conquista
CREATE TABLE IF NOT EXISTS public.vendedor_conquistas (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    vendedor_id uuid REFERENCES public.vendedores(id) ON DELETE CASCADE,
    conquista_id uuid REFERENCES public.conquistas(id) ON DELETE CASCADE,
    data_conquista timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    status text CHECK (status IN ('pendente', 'aprovado')) DEFAULT 'pendente',
    justificativa text,
    evidencia_url text,
    UNIQUE(vendedor_id, conquista_id)
);

-- Adicionar colunas caso não existam (migração idempotente)
DO $$
BEGIN
    -- justificativa
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendedor_conquistas' AND column_name = 'justificativa') THEN
        ALTER TABLE public.vendedor_conquistas ADD COLUMN justificativa text;
    END IF;

    -- evidencia_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendedor_conquistas' AND column_name = 'evidencia_url') THEN
        ALTER TABLE public.vendedor_conquistas ADD COLUMN evidencia_url text;
    END IF;

    -- status (caso tenha sido criado sem)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendedor_conquistas' AND column_name = 'status') THEN
        ALTER TABLE public.vendedor_conquistas ADD COLUMN status text CHECK (status IN ('pendente', 'aprovado')) DEFAULT 'pendente';
    END IF;
END $$;

-- Habilitar RLS
ALTER TABLE public.vendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conquistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendedor_conquistas ENABLE ROW LEVEL SECURITY;

-- Policies (Leitura pública, escrita via service role)
DROP POLICY IF EXISTS "Ler vendedores" ON public.vendedores;
CREATE POLICY "Ler vendedores" ON public.vendedores FOR SELECT USING (true);

DROP POLICY IF EXISTS "Ler conquistas" ON public.conquistas;
CREATE POLICY "Ler conquistas" ON public.conquistas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Ler vendedor_conquistas" ON public.vendedor_conquistas;
CREATE POLICY "Ler vendedor_conquistas" ON public.vendedor_conquistas FOR SELECT USING (true);
