-- Habilita extensões para melhor busca textual
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Adiciona coluna de busca textual (tsvector) na tabela products
-- Nota: Usamos coluna normal + Trigger porque 'unaccent' não é imutável, 
-- o que impede o uso de GENERATED ALWAYS AS (...) STORED
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_description tsvector;

-- Cria função para atualizar o tsvector automaticamente
CREATE OR REPLACE FUNCTION products_tsvector_trigger() RETURNS trigger AS $$
BEGIN
  NEW.name_description :=
    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.name, ''))), 'A') ||
    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.description, ''))), 'B') ||
    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.category, ''))), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Cria o trigger para INSERT e UPDATE
DROP TRIGGER IF EXISTS tsvectorupdate ON products;
CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
    ON products FOR EACH ROW EXECUTE PROCEDURE products_tsvector_trigger();

-- Atualiza linhas existentes para garantir que a coluna seja preenchida agora
UPDATE products SET name_description = 
    setweight(to_tsvector('portuguese', unaccent(coalesce(name, ''))), 'A') ||
    setweight(to_tsvector('portuguese', unaccent(coalesce(description, ''))), 'B') ||
    setweight(to_tsvector('portuguese', unaccent(coalesce(category, ''))), 'C');

-- Cria índice GIN para busca ultra-rápida
CREATE INDEX IF NOT EXISTS products_name_description_idx ON products USING GIN (name_description);

-- Cria índice trgm para busca fuzzy (correção de erros de digitação) no nome
CREATE INDEX IF NOT EXISTS products_name_trgm_idx ON products USING GIN (name gin_trgm_ops);

-- Função RPC para busca Full Text Search (chamada pelo frontend)
CREATE OR REPLACE FUNCTION search_products_fts(query_text text, limit_count int)
RETURNS SETOF products AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM products
  WHERE name_description @@ to_tsquery('portuguese', query_text)
  ORDER BY ts_rank(name_description, to_tsquery('portuguese', query_text)) DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Exemplo de Query para teste (Lógica AND):
-- SELECT * FROM products WHERE name_description @@ to_tsquery('portuguese', 'Desktop & 2025');

-- Exemplo de Query para teste (Fuzzy / Similaridade):
-- SELECT * FROM products WHERE name % 'gforce rtx';
