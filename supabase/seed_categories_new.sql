-- Script para redefinir a estrutura de categorias
-- Copie e cole este conteúdo no Editor SQL do Supabase

-- 1. Limpar categorias existentes (CUIDADO: Isso removerá todas as categorias!)
DELETE FROM public.categories;

-- 2. Garantir que a função auxiliar existe
create or replace function insert_category(cat_name text, cat_slug text, parent_slug text default null, cat_icon text default null, cat_order integer default 0)
returns uuid as $$
declare
    pid uuid;
    cid uuid;
begin
    -- Find parent id if slug provided
    if parent_slug is not null then
        select id into pid from public.categories where slug = parent_slug limit 1;
    end if;

    -- Insert or get existing
    insert into public.categories (name, slug, parent_id, icon, display_order)
    values (cat_name, cat_slug, pid, cat_icon, cat_order)
    on conflict (slug) do update set 
        name = excluded.name,
        parent_id = excluded.parent_id,
        icon = excluded.icon,
        display_order = excluded.display_order
    returning id into cid;

    return cid;
end;
$$ language plpgsql;

-- 3. Inserir nova hierarquia
DO $$
DECLARE
    root_id uuid;
BEGIN
    -- 1. Computadores
    perform insert_category('Computadores', 'computadores', null, 'Monitor', 10);
        perform insert_category('PCs Gamer', 'pcs-gamer', 'computadores', null, 0);
        perform insert_category('PCs de Escritório', 'pcs-de-escritorio', 'computadores', null, 1);

    -- 2. Notebooks
    perform insert_category('Notebooks', 'notebooks', null, 'Laptop', 20);
        perform insert_category('Notebook Gamer', 'notebook-gamer', 'notebooks', null, 0);
        perform insert_category('Notebook Profissional', 'notebook-profissional', 'notebooks', null, 1);

    -- 3. Hardware
    perform insert_category('Hardware', 'hardware', null, 'Cpu', 30);
        perform insert_category('Processadores', 'processadores', 'hardware', null, 0);
        perform insert_category('Placas de Vídeo', 'placas-de-video', 'hardware', null, 1);
        perform insert_category('Memória e Armazenamento', 'memoria-e-armazenamento', 'hardware', null, 2);

    -- 4. Smartphones
    perform insert_category('Smartphones', 'smartphones', null, 'Smartphone', 40);
        perform insert_category('Android', 'android', 'smartphones', null, 0);
        perform insert_category('iPhone', 'iphone', 'smartphones', null, 1);
        perform insert_category('Smartphones Gamer', 'smartphones-gamer', 'smartphones', null, 2);
        perform insert_category('Acessórios para Smartphones', 'acessorios-para-smartphones', 'smartphones', null, 3);

    -- 5. Monitores
    perform insert_category('Monitores', 'monitores', null, 'Monitor', 50);
        perform insert_category('Monitor Gamer', 'monitor-gamer', 'monitores', null, 0);
        perform insert_category('Monitor Profissional', 'monitor-profissional', 'monitores', null, 1);

    -- 6. Periféricos
    perform insert_category('Periféricos', 'perifericos', null, 'Keyboard', 60);
        perform insert_category('Teclados', 'teclados', 'perifericos', null, 0);
        perform insert_category('Mouses', 'mouses', 'perifericos', null, 1);
        perform insert_category('Headsets', 'headsets', 'perifericos', null, 2);

    -- 7. Acessórios
    perform insert_category('Acessórios', 'acessorios', null, 'Plug', 70);
        perform insert_category('Cabos e Adaptadores', 'cabos-e-adaptadores', 'acessorios', null, 0);
        perform insert_category('Suportes e Bases', 'suportes-e-bases', 'acessorios', null, 1);

    -- 8. Segurança
    perform insert_category('Segurança', 'seguranca', null, 'Shield', 80);
        perform insert_category('Câmeras de Segurança', 'cameras-de-seguranca', 'seguranca', null, 0);
        perform insert_category('DVR / NVR', 'dvr-nvr', 'seguranca', null, 1);
        perform insert_category('Alarmes', 'alarmes', 'seguranca', null, 2);
        perform insert_category('Fechaduras Eletrônicas', 'fechaduras-eletronicas', 'seguranca', null, 3);

    -- 9. Automação
    perform insert_category('Automação', 'automacao', null, 'Home', 90);
        perform insert_category('Casa Inteligente', 'casa-inteligente', 'automacao', null, 0);
        perform insert_category('Tomadas Inteligentes', 'tomadas-inteligentes', 'automacao', null, 1);
        perform insert_category('Lâmpadas Inteligentes', 'lampadas-inteligentes', 'automacao', null, 2);
        perform insert_category('Assistentes Virtuais', 'assistentes-virtuais', 'automacao', null, 3);

    -- 10. Geek
    perform insert_category('Geek', 'geek', null, 'Ghost', 100);
        perform insert_category('Action Figures', 'action-figures', 'geek', null, 0);
        perform insert_category('Colecionáveis', 'colecionaveis', 'geek', null, 1);
        perform insert_category('Decoração Geek', 'decoracao-geek', 'geek', null, 2);
        perform insert_category('Vestuário Geek', 'vestuario-geek', 'geek', null, 3);

    -- 11. Licenças
    perform insert_category('Licenças', 'licencas', null, 'Key', 110);
        perform insert_category('Windows', 'windows', 'licencas', null, 0);
        perform insert_category('Office', 'office', 'licencas', null, 1);
        perform insert_category('Antivírus', 'antivirus', 'licencas', null, 2);

    -- 12. Escritório
    perform insert_category('Escritório', 'escritorio', null, 'Armchair', 120);
        perform insert_category('Cadeiras', 'cadeiras', 'escritorio', null, 0);
        perform insert_category('Mesas', 'mesas', 'escritorio', null, 1);

    -- 13. Games
    perform insert_category('Games', 'games', null, 'Gamepad', 130);
        perform insert_category('Jogos', 'jogos', 'games', null, 0);
        perform insert_category('Consoles', 'consoles', 'games', null, 1);
        perform insert_category('Gift Cards', 'gift-cards', 'games', null, 2);

    -- 14. Apple
    perform insert_category('Apple', 'apple', null, 'Smartphone', 140);
        perform insert_category('Mac', 'mac', 'apple', null, 0);
        perform insert_category('iPhone', 'iphone-apple', 'apple', null, 1); -- Slug unique conflict with smartphone iPhone? slug must be unique.
        perform insert_category('iPad', 'ipad', 'apple', null, 2);
        perform insert_category('Acessórios Apple', 'acessorios-apple', 'apple', null, 3);

    -- 15. Impressão
    perform insert_category('Impressão', 'impressao', null, 'Printer', 150);
        perform insert_category('Impressoras', 'impressoras', 'impressao', null, 0);
        perform insert_category('Cartuchos e Toners', 'cartuchos-e-toners', 'impressao', null, 1);

END $$;
