-- Script para redefinir a estrutura de categorias (ATUALIZADO COM ÍCONES)
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
    -- 1. Computadores (Monitor)
    perform insert_category('Computadores', 'computadores', null, 'Monitor', 10);
        perform insert_category('PC Gamer', 'pc-gamer', 'computadores', 'Gamepad2', 0);
        perform insert_category('PC Corporativo / Escritório', 'pc-corporativo', 'computadores', 'Briefcase', 1);
        perform insert_category('Workstation', 'workstation', 'computadores', 'Server', 2);
        perform insert_category('All‑in‑One', 'all-in-one', 'computadores', 'Monitor', 3);
        perform insert_category('Mini PC', 'mini-pc', 'computadores', 'Box', 4);

    -- 2. Notebooks (Laptop)
    perform insert_category('Notebooks', 'notebooks', null, 'Laptop', 20);
        perform insert_category('Notebooks Gamer', 'notebooks-gamer', 'notebooks', 'Gamepad2', 0);
        perform insert_category('Ultrabook', 'ultrabook', 'notebooks', 'Feather', 1);
        perform insert_category('MacBook', 'macbook-notebooks', 'notebooks', 'Laptop', 2);
        perform insert_category('Notebooks para Trabalho', 'notebooks-trabalho', 'notebooks', 'Briefcase', 3);
        perform insert_category('Chromebook', 'chromebook', 'notebooks', 'Globe', 4);
        perform insert_category('Acessórios para Notebook', 'acessorios-notebook', 'notebooks', 'Plug', 5);

    -- 3. Hardware (Cpu)
    perform insert_category('Hardware', 'hardware', null, 'Cpu', 30);
        perform insert_category('Processadores (CPU)', 'processadores', 'hardware', 'Cpu', 0);
        perform insert_category('Placas de Vídeo (GPU)', 'placas-de-video', 'hardware', 'Aperture', 1);
        perform insert_category('Placas‑Mãe', 'placas-mae', 'hardware', 'CircuitBoard', 2);
        perform insert_category('Memória RAM', 'memoria-ram', 'hardware', 'MemoryStick', 3);
        perform insert_category('SSD / HD / NVMe', 'ssd-hd-nvme', 'hardware', 'HardDrive', 4);
        perform insert_category('Fontes de Alimentação', 'fontes-alimentacao', 'hardware', 'Zap', 5);
        perform insert_category('Gabinetes', 'gabinetes', 'hardware', 'Box', 6);
        perform insert_category('Coolers e Water Cooler', 'coolers', 'hardware', 'Fan', 7);
        perform insert_category('Placas de Rede / Som', 'placas-rede-som', 'hardware', 'Network', 8);

    -- 4. Periféricos (Keyboard)
    perform insert_category('Periféricos', 'perifericos', null, 'Keyboard', 40);
        perform insert_category('Mouse e Mousepad', 'mouse-mousepad', 'perifericos', 'Mouse', 0);
        perform insert_category('Teclados', 'teclados', 'perifericos', 'Keyboard', 1);
        perform insert_category('Headsets e Fones', 'headsets-fones', 'perifericos', 'Headphones', 2);
        perform insert_category('Microfones', 'microfones', 'perifericos', 'Mic', 3);
        perform insert_category('Webcams', 'webcams', 'perifericos', 'Camera', 4);
        perform insert_category('Caixas de Som', 'caixas-de-som', 'perifericos', 'Speaker', 5);
        perform insert_category('Controles e Joysticks', 'controles-joysticks', 'perifericos', 'Gamepad', 6);
        perform insert_category('Hubs USB', 'hubs-usb', 'perifericos', 'Usb', 7);
        perform insert_category('Mesas Digitalizadoras', 'mesas-digitalizadoras', 'perifericos', 'PenTool', 8);

    -- 5. Monitores (Monitor)
    perform insert_category('Monitores', 'monitores', null, 'Monitor', 50);
        perform insert_category('Monitores Gamer', 'monitores-gamer', 'monitores', 'Gamepad2', 0);
        perform insert_category('Monitores 4K / Ultrawide', 'monitores-4k-ultrawide', 'monitores', 'Monitor', 1);
        perform insert_category('Monitores para Escritório', 'monitores-escritorio', 'monitores', 'Briefcase', 2);
        perform insert_category('Suportes para Monitor', 'suportes-monitor', 'monitores', 'Move', 3);
        perform insert_category('Acessórios de Vídeo', 'acessorios-video', 'monitores', 'Cable', 4);

    -- 6. Cadeiras e Escritório (Armchair)
    perform insert_category('Cadeiras e Escritório', 'cadeiras-escritorio', null, 'Armchair', 60);
        perform insert_category('Cadeiras Gamer', 'cadeiras-gamer', 'cadeiras-escritorio', 'Armchair', 0);
        perform insert_category('Cadeiras de Escritório', 'cadeiras-de-escritorio', 'cadeiras-escritorio', 'Briefcase', 1);
        perform insert_category('Mesas Gamer / Escritório', 'mesas-gamer-escritorio', 'cadeiras-escritorio', 'Table', 2);
        perform insert_category('Iluminação e LED', 'iluminacao-led', 'cadeiras-escritorio', 'Lightbulb', 3);
        perform insert_category('Organização de Cabos', 'organizacao-cabos', 'cadeiras-escritorio', 'Cable', 4);

    -- 7. Redes e Conectividade (Wifi)
    perform insert_category('Redes e Conectividade', 'redes-conectividade', null, 'Wifi', 70);
        perform insert_category('Roteadores Wi‑Fi e Mesh', 'roteadores', 'redes-conectividade', 'Wifi', 0);
        perform insert_category('Repetidores de Sinal', 'repetidores', 'redes-conectividade', 'Signal', 1);
        perform insert_category('Switch e Hubs', 'switch-hubs', 'redes-conectividade', 'Network', 2);
        perform insert_category('Cabos de Rede', 'cabos-rede', 'redes-conectividade', 'Cable', 3);
        perform insert_category('Adaptadores USB / Wi‑Fi', 'adaptadores-usb-wifi', 'redes-conectividade', 'Usb', 4);
        perform insert_category('Modems 4G / 5G', 'modems', 'redes-conectividade', 'Radio', 5);
        perform insert_category('Racks e Patch Panels', 'racks-patch-panels', 'redes-conectividade', 'Server', 6);

    -- 8. Servidores e Automação (Server)
    perform insert_category('Servidores e Automação', 'servidores-automacao', null, 'Server', 80);
        perform insert_category('Servidores Torre / Rack', 'servidores', 'servidores-automacao', 'Server', 0);
        perform insert_category('Storage (NAS / DAS)', 'storage', 'servidores-automacao', 'Database', 1);
        perform insert_category('Nobreaks e Estabilizadores', 'nobreaks-estabilizadores', 'servidores-automacao', 'Battery', 2);
        perform insert_category('Automação Comercial', 'automacao-comercial', 'servidores-automacao', 'Store', 3);
        perform insert_category('Leitores de Código de Barras', 'leitores-codigo-barras', 'servidores-automacao', 'Scan', 4);
        perform insert_category('Impressoras Térmicas', 'impressoras-termicas', 'servidores-automacao', 'Printer', 5);

    -- 9. Games e Consoles (Gamepad)
    perform insert_category('Games e Consoles', 'games-consoles', null, 'Gamepad', 90);
        perform insert_category('PlayStation 5', 'playstation-5', 'games-consoles', 'Gamepad', 0);
        perform insert_category('Xbox Series X/S', 'xbox-series', 'games-consoles', 'Gamepad', 1);
        perform insert_category('Nintendo Switch', 'nintendo-switch', 'games-consoles', 'Gamepad', 2);
        perform insert_category('Consoles Retrô', 'consoles-retro', 'games-consoles', 'Joystick', 3);
        perform insert_category('Jogos (Mídia Física)', 'jogos-fisicos', 'games-consoles', 'Disc', 4);
        perform insert_category('Acessórios de Console', 'acessorios-console', 'games-consoles', 'Headphones', 5);
        perform insert_category('Volantes e Simuladores', 'volantes-simuladores', 'games-consoles', 'Gamepad', 6);

    -- 10. Apple (Apple)
    perform insert_category('Apple', 'apple', null, 'Apple', 100);
        perform insert_category('iPhone', 'iphone', 'apple', 'Smartphone', 0);
        perform insert_category('iPad', 'ipad', 'apple', 'Tablet', 1);
        perform insert_category('MacBook', 'macbook-apple', 'apple', 'Laptop', 2);
        perform insert_category('iMac / Mac Mini', 'imac-mac-mini', 'apple', 'Monitor', 3);
        perform insert_category('Apple Watch', 'apple-watch', 'apple', 'Watch', 4);
        perform insert_category('AirPods e Acessórios', 'airpods-acessorios', 'apple', 'Headphones', 5);

    -- 11. Smart Home (Home)
    perform insert_category('Smart Home', 'smart-home', null, 'Home', 110);
        perform insert_category('Assistentes Virtuais (Alexa/Google)', 'assistentes-virtuais', 'smart-home', 'Mic', 0);
        perform insert_category('Lâmpadas Inteligentes', 'lampadas-inteligentes', 'smart-home', 'Lightbulb', 1);
        perform insert_category('Fechaduras Digitais', 'fechaduras-digitais', 'smart-home', 'Lock', 2);
        perform insert_category('Câmeras de Segurança', 'cameras-seguranca', 'smart-home', 'Video', 3);
        perform insert_category('Sensores e Alarmes', 'sensores-alarmes', 'smart-home', 'Bell', 4);
        perform insert_category('Tomadas Inteligentes', 'tomadas-inteligentes', 'smart-home', 'Power', 5);
        perform insert_category('Robôs Aspiradores', 'robos-aspiradores', 'smart-home', 'Bot', 6);

    -- 12. Áudio e Vídeo (Speaker)
    perform insert_category('Áudio e Vídeo', 'audio-video', null, 'Speaker', 120);
        perform insert_category('Soundbars e Home Theater', 'soundbars-home-theater', 'audio-video', 'Speaker', 0);
        perform insert_category('Caixas de Som Bluetooth', 'caixas-som-bluetooth', 'audio-video', 'Bluetooth', 1);
        perform insert_category('Projetores e Telas', 'projetores-telas', 'audio-video', 'Projector', 2);
        perform insert_category('Cabos HDMI / Áudio', 'cabos-hdmi-audio', 'audio-video', 'Cable', 3);
        perform insert_category('Streaming (Chromecast/Fire TV)', 'streaming', 'audio-video', 'Cast', 4);

    -- 13. Geek e Colecionáveis (Ghost)
    perform insert_category('Geek e Colecionáveis', 'geek-colecionaveis', null, 'Ghost', 130);
        perform insert_category('Action Figures', 'action-figures', 'geek-colecionaveis', 'User', 0);
        perform insert_category('Funko Pop', 'funko-pop', 'geek-colecionaveis', 'Smile', 1);
        perform insert_category('Camisetas e Vestuário', 'camisetas-vestuario', 'geek-colecionaveis', 'Shirt', 2);
        perform insert_category('Canecas e Decoração', 'canecas-decoracao', 'geek-colecionaveis', 'Coffee', 3);
        perform insert_category('Mochilas e Malas', 'mochilas-malas', 'geek-colecionaveis', 'Backpack', 4);
        perform insert_category('Board Games / RPG', 'board-games-rpg', 'geek-colecionaveis', 'Dices', 5);

    -- 14. Energia (Zap)
    perform insert_category('Energia', 'energia', null, 'Zap', 140);
        perform insert_category('Nobreaks', 'nobreaks', 'energia', 'Battery', 0);
        perform insert_category('Filtros de Linha', 'filtros-linha', 'energia', 'Power', 1);
        perform insert_category('Baterias e Pilhas', 'baterias-pilhas', 'energia', 'Battery', 2);
        perform insert_category('Carregadores e Cabos', 'carregadores-cabos', 'energia', 'Zap', 3);
        perform insert_category('Transformadores', 'transformadores', 'energia', 'RefreshCcw', 4);

    -- 15. Impressão (Printer)
    perform insert_category('Impressão', 'impressao', null, 'Printer', 150);
        perform insert_category('Impressoras Jato de Tinta', 'impressoras-jato-tinta', 'impressao', 'Printer', 0);
        perform insert_category('Impressoras Laser', 'impressoras-laser', 'impressao', 'Printer', 1);
        perform insert_category('Multifuncionais', 'multifuncionais', 'impressao', 'Copy', 2);
        perform insert_category('Cartuchos de Tinta', 'cartuchos-tinta', 'impressao', 'Droplet', 3);
        perform insert_category('Toners', 'toners', 'impressao', 'Cylinder', 4);
        perform insert_category('Papel Fotográfico', 'papel-fotografico', 'impressao', 'Image', 5);
        perform insert_category('Etiquetas', 'etiquetas', 'impressao', 'Tag', 6);
        perform insert_category('Scanners', 'scanners', 'impressao', 'Scan', 7);

END $$;
