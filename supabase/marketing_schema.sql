-- Tabela de Assinantes (Marketing)
CREATE TABLE IF NOT EXISTS marketing_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  source TEXT DEFAULT 'site', -- 'footer', 'checkout', 'register', 'contact'
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Campanhas
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL, -- Nome interno da campanha
  subject TEXT NOT NULL, -- Assunto do e-mail
  content TEXT NOT NULL, -- Conteúdo HTML
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'failed'
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  target_audience TEXT DEFAULT 'all', -- 'all', 'customers', 'leads'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Logs de Envio
CREATE TABLE IF NOT EXISTS marketing_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event TEXT NOT NULL, -- 'order_new', 'user_register', 'campaign_sent', etc.
  recipient TEXT NOT NULL,
  status TEXT NOT NULL, -- 'success', 'error'
  error_message TEXT,
  metadata JSONB, -- Dados extras do evento (id do pedido, etc)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas de Segurança (RLS)

-- Subscribers: Público pode inserir (inscrever-se), apenas Admin pode ver tudo
ALTER TABLE marketing_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to subscribers" ON marketing_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin full access to subscribers" ON marketing_subscribers
  FOR ALL USING (auth.role() = 'service_role' OR auth.jwt() ->> 'email' = 'balaocastelo@gmail.com'); -- Ajustar conforme lógica de admin

-- Campaigns: Apenas Admin
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin full access to campaigns" ON marketing_campaigns
  FOR ALL USING (auth.role() = 'service_role');

-- Logs: Apenas Admin
ALTER TABLE marketing_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin full access to logs" ON marketing_logs
  FOR ALL USING (auth.role() = 'service_role');
