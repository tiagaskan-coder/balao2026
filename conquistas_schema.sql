-- 1. Estrutura de Dados

-- Tabela de Conquistas (Definição dos Emblemas)
CREATE TABLE IF NOT EXISTS conquistas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT NOT NULL,
    icone_url TEXT NOT NULL, -- Pode ser um emoji ou URL de imagem
    xp_valor INTEGER DEFAULT 0,
    tipo TEXT CHECK (tipo IN ('automatico', 'manual')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Vínculo (Quais vendedores têm quais conquistas)
CREATE TABLE IF NOT EXISTS vendedor_conquistas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendedor_id UUID NOT NULL REFERENCES vendedores(id) ON DELETE CASCADE,
    conquista_id UUID NOT NULL REFERENCES conquistas(id) ON DELETE CASCADE,
    data_conquista TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT CHECK (status IN ('pendente', 'aprovado')) DEFAULT 'aprovado',
    UNIQUE(vendedor_id, conquista_id) -- Evita duplicidade da mesma conquista para o mesmo vendedor
);

-- Tabela de Itens da Venda (Necessária para validação de produtos/categorias)
CREATE TABLE IF NOT EXISTS venda_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
    produto_nome TEXT NOT NULL,
    categoria TEXT, -- Ex: 'PC Gamer', 'iPhone', 'Periféricos', etc.
    valor NUMERIC NOT NULL,
    quantidade INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserção das Conquistas Iniciais (Seed Data)
INSERT INTO conquistas (nome, descricao, icone_url, xp_valor, tipo) VALUES
('Primeira do Dia', 'Realizou a primeira venda do dia na loja.', '🌅', 100, 'automatico'),
('Muralha de Ferro', 'Atingiu R$ 10.000,00 em vendas na semana.', '🛡️', 500, 'automatico'),
('Mestre do Hardware', 'Vendeu um produto da categoria PC Gamer.', '🖥️', 200, 'automatico'),
('Combo Master', 'Vendeu 3 ou mais itens distintos em uma única venda.', '🔥', 300, 'automatico'),
('Especialista Apple', 'Vendeu 2 iPhones no mesmo dia.', '🍎', 400, 'automatico'),
('Estrela do Google', 'Recebeu uma avaliação 5 estrelas nominal no Google.', '⭐', 600, 'manual'),
('Vendedor Lendário', 'Bateu a meta mensal da loja.', '🏆', 1000, 'manual'),
('Velocidade da Luz', 'Fechou uma venda em tempo recorde.', '⚡', 150, 'manual'),
('Encantador de Clientes', 'Elogio formal enviado por cliente.', '🤝', 250, 'manual'),
('Rei dos Acessórios', 'Vendeu mais de 50 acessórios no mês.', '🎧', 350, 'manual')
ON CONFLICT DO NOTHING;

-- 2. Regras de Negócio (Triggers e Functions)

-- Função Trigger Principal: Verifica conquistas após cada venda
CREATE OR REPLACE FUNCTION verificar_conquistas_venda()
RETURNS TRIGGER AS $$
DECLARE
    v_total_semana NUMERIC;
    v_iphone_count INTEGER;
    v_conquista_id UUID;
    v_tem_pc_gamer BOOLEAN;
    v_qtd_itens_distintos INTEGER;
BEGIN
    -- 1. Primeira do Dia
    -- Verifica se já existe alguma venda deste vendedor hoje (excluindo a atual se for update, mas aqui é after insert)
    IF NOT EXISTS (
        SELECT 1 FROM vendas 
        WHERE vendedor_id = NEW.vendedor_id 
        AND DATE(criado_em) = DATE(NEW.criado_em)
        AND id <> NEW.id
    ) THEN
        SELECT id INTO v_conquista_id FROM conquistas WHERE nome = 'Primeira do Dia';
        IF v_conquista_id IS NOT NULL THEN
            INSERT INTO vendedor_conquistas (vendedor_id, conquista_id, status)
            VALUES (NEW.vendedor_id, v_conquista_id, 'aprovado')
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;

    -- 2. Muralha de Ferro (R$ 10.000 na semana)
    -- Calcula total de vendas do vendedor na semana atual (início segunda-feira)
    SELECT COALESCE(SUM(valor), 0) INTO v_total_semana
    FROM vendas
    WHERE vendedor_id = NEW.vendedor_id
    AND criado_em >= date_trunc('week', NEW.criado_em);

    IF v_total_semana >= 10000 THEN
        SELECT id INTO v_conquista_id FROM conquistas WHERE nome = 'Muralha de Ferro';
        IF v_conquista_id IS NOT NULL THEN
            INSERT INTO vendedor_conquistas (vendedor_id, conquista_id, status)
            VALUES (NEW.vendedor_id, v_conquista_id, 'aprovado')
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;

    -- 3. Mestre do Hardware (Categoria 'PC Gamer')
    -- Verifica na tabela venda_itens se existe algum item com categoria 'PC Gamer' para esta venda
    SELECT EXISTS (
        SELECT 1 FROM venda_itens 
        WHERE venda_id = NEW.id 
        AND categoria ILIKE '%PC Gamer%'
    ) INTO v_tem_pc_gamer;

    IF v_tem_pc_gamer THEN
        SELECT id INTO v_conquista_id FROM conquistas WHERE nome = 'Mestre do Hardware';
        IF v_conquista_id IS NOT NULL THEN
            INSERT INTO vendedor_conquistas (vendedor_id, conquista_id, status)
            VALUES (NEW.vendedor_id, v_conquista_id, 'aprovado')
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;

    -- 4. Combo Master (3 ou mais itens distintos)
    SELECT COUNT(DISTINCT produto_nome) INTO v_qtd_itens_distintos
    FROM venda_itens
    WHERE venda_id = NEW.id;

    IF v_qtd_itens_distintos >= 3 THEN
        SELECT id INTO v_conquista_id FROM conquistas WHERE nome = 'Combo Master';
        IF v_conquista_id IS NOT NULL THEN
            INSERT INTO vendedor_conquistas (vendedor_id, conquista_id, status)
            VALUES (NEW.vendedor_id, v_conquista_id, 'aprovado')
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;

    -- 5. Especialista Apple (2 iPhones no mesmo dia)
    -- Conta quantas vendas de 'iPhone' o vendedor fez hoje (precisa cruzar com venda_itens e vendas)
    SELECT COUNT(DISTINCT v.id) INTO v_iphone_count
    FROM vendas v
    JOIN venda_itens vi ON v.id = vi.venda_id
    WHERE v.vendedor_id = NEW.vendedor_id
    AND DATE(v.criado_em) = DATE(NEW.criado_em)
    AND (vi.produto_nome ILIKE '%iPhone%' OR vi.categoria ILIKE '%iPhone%');

    IF v_iphone_count >= 2 THEN
        SELECT id INTO v_conquista_id FROM conquistas WHERE nome = 'Especialista Apple';
        IF v_conquista_id IS NOT NULL THEN
            INSERT INTO vendedor_conquistas (vendedor_id, conquista_id, status)
            VALUES (NEW.vendedor_id, v_conquista_id, 'aprovado')
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para tabela vendas
DROP TRIGGER IF EXISTS trigger_verificar_conquistas ON vendas;
CREATE TRIGGER trigger_verificar_conquistas
AFTER INSERT ON vendas
FOR EACH ROW EXECUTE FUNCTION verificar_conquistas_venda();

-- Trigger auxiliar para tabela venda_itens (caso os itens sejam inseridos depois da venda)
-- É comum inserir Venda primeiro, depois Itens. O trigger na venda pode não ver os itens se forem inseridos depois.
-- Então criamos um trigger também em venda_itens para verificar as conquistas baseadas em itens.
CREATE OR REPLACE FUNCTION verificar_conquistas_item()
RETURNS TRIGGER AS $$
DECLARE
    v_venda RECORD;
    v_conquista_id UUID;
    v_tem_pc_gamer BOOLEAN;
    v_qtd_itens_distintos INTEGER;
    v_iphone_count INTEGER;
BEGIN
    SELECT * INTO v_venda FROM vendas WHERE id = NEW.venda_id;
    IF NOT FOUND THEN RETURN NEW; END IF;

    -- 3. Mestre do Hardware (Categoria 'PC Gamer')
    IF NEW.categoria ILIKE '%PC Gamer%' THEN
        SELECT id INTO v_conquista_id FROM conquistas WHERE nome = 'Mestre do Hardware';
        IF v_conquista_id IS NOT NULL THEN
            INSERT INTO vendedor_conquistas (vendedor_id, conquista_id, status)
            VALUES (v_venda.vendedor_id, v_conquista_id, 'aprovado')
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;

    -- 4. Combo Master (3 ou mais itens distintos)
    SELECT COUNT(DISTINCT produto_nome) INTO v_qtd_itens_distintos
    FROM venda_itens
    WHERE venda_id = NEW.venda_id;

    IF v_qtd_itens_distintos >= 3 THEN
        SELECT id INTO v_conquista_id FROM conquistas WHERE nome = 'Combo Master';
        IF v_conquista_id IS NOT NULL THEN
            INSERT INTO vendedor_conquistas (vendedor_id, conquista_id, status)
            VALUES (v_venda.vendedor_id, v_conquista_id, 'aprovado')
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;

    -- 5. Especialista Apple (2 iPhones no mesmo dia)
    IF NEW.produto_nome ILIKE '%iPhone%' OR NEW.categoria ILIKE '%iPhone%' THEN
        SELECT COUNT(DISTINCT v.id) INTO v_iphone_count
        FROM vendas v
        JOIN venda_itens vi ON v.id = vi.venda_id
        WHERE v.vendedor_id = v_venda.vendedor_id
        AND DATE(v.criado_em) = DATE(v_venda.criado_em)
        AND (vi.produto_nome ILIKE '%iPhone%' OR vi.categoria ILIKE '%iPhone%');

        IF v_iphone_count >= 2 THEN
            SELECT id INTO v_conquista_id FROM conquistas WHERE nome = 'Especialista Apple';
            IF v_conquista_id IS NOT NULL THEN
                INSERT INTO vendedor_conquistas (vendedor_id, conquista_id, status)
                VALUES (v_venda.vendedor_id, v_conquista_id, 'aprovado')
                ON CONFLICT DO NOTHING;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_verificar_conquistas_item ON venda_itens;
CREATE TRIGGER trigger_verificar_conquistas_item
AFTER INSERT ON venda_itens
FOR EACH ROW EXECUTE FUNCTION verificar_conquistas_item();
