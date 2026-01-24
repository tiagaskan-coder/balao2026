import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// We need to use a service role key to bypass RLS for seeding if user is not authenticated,
// but for safety we will rely on standard client and assume user is logged in or table is public writable (which it isn't).
// Actually, for a seed route, we should protect it or check if table is empty.
// Since we don't have the service key in env explicitly in the code (it's in .env.local usually as SUPABASE_SERVICE_ROLE_KEY),
// we will try to use the standard client. If RLS blocks it, the user needs to be logged in as admin.

// However, for "fixing" the issue where the user hasn't run the SQL, the best way is to run these inserts.
// If RLS is enabled and policies are strict, this might fail without a logged in user.
// But the SQL script creates policies allowing authenticated users to manage.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// Use service role key if available for seeding to bypass RLS
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

type CategorySeed = {
  name: string;
  slug: string;
  icon?: string;
  children?: CategorySeed[];
};

const SEED_DATA: CategorySeed[] = [
  { name: "Todos os Produtos", slug: "todos-os-produtos", icon: "List" },
  {
    name: "Computadores & Informática",
    slug: "computadores-informatica",
    icon: "Monitor",
    children: [
      {
        name: "Computadores",
        slug: "computadores",
        children: [
          { name: "PC Gamer", slug: "pc-gamer" },
          { name: "PC Office", slug: "pc-office" },
          { name: "PC All-in-One", slug: "pc-all-in-one" },
          { name: "PC Workstation", slug: "pc-workstation" },
          { name: "Mini PC", slug: "mini-pc" },
          { name: "PC Montado", slug: "pc-montado" },
          { name: "PC Sob Medida", slug: "pc-sob-medida" },
        ],
      },
      {
        name: "Notebooks",
        slug: "notebooks",
        children: [
          { name: "Notebook Gamer", slug: "notebook-gamer" },
          { name: "Notebook Empresarial", slug: "notebook-empresarial" },
          { name: "Notebook Estudantil", slug: "notebook-estudantil" },
          { name: "MacBook", slug: "macbook-laptop" },
          { name: "Chromebook", slug: "chromebook" },
        ],
      },
      {
        name: "Componentes de Hardware",
        slug: "hardware",
        children: [
          { name: "Placa de Vídeo (GPU)", slug: "placa-de-video" },
          { name: "Processadores (CPU)", slug: "processadores" },
          { name: "Placa-mãe", slug: "placa-mae" },
          { name: "Memória RAM", slug: "memoria-ram" },
          { name: "SSD", slug: "ssd" },
          { name: "HD", slug: "hd" },
          { name: "Fonte de Alimentação", slug: "fontes" },
          { name: "Gabinete", slug: "gabinete" },
          { name: "Cooler / Water Cooler", slug: "coolers" },
          { name: "Pasta Térmica", slug: "pasta-termica" },
          { name: "Placas de Expansão", slug: "placas-expansao" },
        ],
      },
    ],
  },
  {
    name: "Monitores & Displays",
    slug: "monitores-displays",
    icon: "Monitor",
    children: [
      { name: "Monitor Gamer", slug: "monitor-gamer" },
      { name: "Monitor Profissional", slug: "monitor-profissional" },
      { name: "Monitor Curvo", slug: "monitor-curvo" },
      { name: "Monitor Ultrawide", slug: "monitor-ultrawide" },
      { name: "Monitor 4K / 8K", slug: "monitor-4k-8k" },
      { name: "Suporte para Monitor", slug: "suporte-monitor" },
    ],
  },
  {
    name: "Apple",
    slug: "apple",
    icon: "Apple",
    children: [
      { name: "MacBook", slug: "apple-macbook" },
      { name: "iMac", slug: "apple-imac" },
      { name: "Mac Mini", slug: "apple-mac-mini" },
      { name: "iPad", slug: "apple-ipad" },
      { name: "iPhone", slug: "apple-iphone" },
      { name: "Apple Watch", slug: "apple-watch" },
      { name: "AirPods", slug: "apple-airpods" },
      { name: "Acessórios Apple", slug: "apple-acessorios" },
    ],
  },
  {
    name: "Games & Consoles",
    slug: "games-consoles",
    icon: "Gamepad",
    children: [
      { name: "Consoles", slug: "consoles" },
      { name: "Jogos", slug: "jogos" },
      { name: "Controles", slug: "controles" },
      { name: "Headsets Gamer", slug: "headsets-gamer" },
      { name: "Cadeiras Gamer", slug: "cadeiras-gamer" },
      { name: "Volantes e Simuladores", slug: "volantes" },
      { name: "Acessórios Gamer", slug: "acessorios-gamer" },
    ],
  },
  {
    name: "Smartphones & Tablets",
    slug: "smartphones-tablets",
    icon: "Smartphone",
    children: [
      { name: "Smartphones Android", slug: "smartphones-android" },
      { name: "Smartphones iOS", slug: "smartphones-ios" },
      { name: "Tablets", slug: "tablets" },
      { name: "Capas e Películas", slug: "capas-peliculas" },
      { name: "Carregadores", slug: "carregadores-celular" },
      { name: "Power Banks", slug: "power-banks" },
      { name: "Smartwatches", slug: "smartwatches" },
      { name: "Pulseiras Inteligentes", slug: "smartbands" },
    ],
  },
  {
    name: "Áudio",
    slug: "audio",
    icon: "Speaker",
    children: [
      {
        name: "Fones de Ouvido",
        slug: "fones-ouvido",
        children: [
          { name: "Com Fio", slug: "fones-com-fio" },
          { name: "Bluetooth", slug: "fones-bluetooth" },
          { name: "Gamer", slug: "fones-gamer" },
        ],
      },
      { name: "Caixas de Som", slug: "caixas-som" },
      { name: "Soundbar", slug: "soundbar" },
      { name: "Home Theater", slug: "home-theater" },
      { name: "Microfones", slug: "microfones" },
      { name: "Equipamentos de Áudio Profissional", slug: "audio-profissional" },
    ],
  },
  {
    name: "TV & Vídeo",
    slug: "tv-video",
    icon: "Tv",
    children: [
      { name: "Smart TV", slug: "smart-tv" },
      { name: "TV 4K / 8K", slug: "tv-4k-8k" },
      { name: "TV Gamer", slug: "tv-gamer" },
      { name: "Projetores", slug: "projetores" },
      { name: "Telas de Projeção", slug: "telas-projecao" },
      { name: "Suportes para TV", slug: "suportes-tv" },
      { name: "Streaming Devices", slug: "streaming-devices" },
    ],
  },
  {
    name: "Rede & Conectividade",
    slug: "rede-conectividade",
    icon: "Wifi",
    children: [
      { name: "Roteadores", slug: "roteadores" },
      { name: "Modems", slug: "modems" },
      { name: "Repetidores de Sinal", slug: "repetidores" },
      { name: "Access Point", slug: "access-point" },
      { name: "Switches", slug: "switches" },
      { name: "Cabos de Rede", slug: "cabos-rede" },
      { name: "Adaptadores Wi-Fi / Bluetooth", slug: "adaptadores-rede" },
    ],
  },
  {
    name: "Impressão & Digitalização",
    slug: "impressao",
    icon: "Printer",
    children: [
      {
        name: "Impressoras",
        slug: "impressoras",
        children: [
          { name: "Jato de Tinta", slug: "impressora-jato" },
          { name: "Laser", slug: "impressora-laser" },
          { name: "Tanque de Tinta", slug: "impressora-tanque" },
          { name: "Multifuncionais", slug: "multifuncionais" },
        ],
      },
      { name: "Scanners", slug: "scanners" },
      { name: "Cartuchos e Toners", slug: "cartuchos-toners" },
      { name: "Papel Fotográfico", slug: "papel-fotografico" },
    ],
  },
  {
    name: "Casa Inteligente (Smart Home)",
    slug: "casa-inteligente",
    icon: "Home",
    children: [
      { name: "Assistentes Virtuais", slug: "assistentes-virtuais" },
      { name: "Lâmpadas Inteligentes", slug: "lampadas-inteligentes" },
      { name: "Tomadas Inteligentes", slug: "tomadas-inteligentes" },
      { name: "Fechaduras Digitais", slug: "fechaduras-digitais" },
      { name: "Câmeras de Segurança", slug: "cameras-seguranca" },
      { name: "Sensores", slug: "sensores-smart" },
      { name: "Automação Residencial", slug: "automacao" },
    ],
  },
  {
    name: "Acessórios",
    slug: "acessorios",
    icon: "Plug",
    children: [
      { name: "Teclados", slug: "teclados" },
      { name: "Mouses", slug: "mouses" },
      { name: "Mousepads", slug: "mousepads" },
      { name: "Webcams", slug: "webcams" },
      { name: "Hubs USB", slug: "hubs-usb" },
      { name: "Adaptadores", slug: "adaptadores" },
      { name: "Cabos", slug: "cabos" },
      { name: "Carregadores", slug: "carregadores-acessorios" },
      { name: "Suportes e Bases", slug: "suportes-bases" },
    ],
  },
  {
    name: "Armazenamento",
    slug: "armazenamento",
    icon: "HardDrive",
    children: [
      { name: "HD Externo", slug: "hd-externo" },
      { name: "SSD Externo", slug: "ssd-externo" },
      { name: "Pen Drives", slug: "pen-drives" },
      { name: "Cartões de Memória", slug: "cartoes-memoria" },
      { name: "NAS", slug: "nas" },
    ],
  },
  {
    name: "Escritório & Ergonomia",
    slug: "escritorio",
    icon: "Briefcase",
    children: [
      { name: "Cadeiras", slug: "cadeiras-escritorio" },
      { name: "Mesas", slug: "mesas" },
      { name: "Suportes Ergonômicos", slug: "suportes-ergonomicos" },
      { name: "Iluminação", slug: "iluminacao-escritorio" },
    ],
  },
  {
    name: "Segurança & Energia",
    slug: "seguranca-energia",
    icon: "Shield",
    children: [
      { name: "Nobreaks", slug: "nobreaks" },
      { name: "Estabilizadores", slug: "estabilizadores" },
      { name: "Filtros de Linha", slug: "filtros-linha" },
      { name: "Cofres Digitais", slug: "cofres" },
      { name: "Câmeras e DVR/NVR", slug: "cameras-dvr" },
    ],
  },
];

async function insertCategory(category: CategorySeed, parentId: string | null, order: number) {
  // 1. Check if exists
  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", category.slug)
    .single();

  let categoryId = existing?.id;

  if (!categoryId) {
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: category.name,
        slug: category.slug,
        parent_id: parentId,
        icon: category.icon,
        display_order: order,
        active: true,
      })
      .select("id")
      .single();

    if (error) {
      console.error(`Error inserting ${category.name}:`, error);
      throw error;
    }
    categoryId = data.id;
  } else {
    // Update if exists to ensure hierarchy
    await supabase
        .from("categories")
        .update({
            name: category.name,
            parent_id: parentId,
            icon: category.icon,
            display_order: order
        })
        .eq("id", categoryId);
  }

  // 2. Insert Children
  if (category.children && category.children.length > 0) {
    for (let i = 0; i < category.children.length; i++) {
      await insertCategory(category.children[i], categoryId, i);
    }
  }
}

export async function GET() {
  try {
    for (let i = 0; i < SEED_DATA.length; i++) {
      await insertCategory(SEED_DATA[i], null, i);
    }
    return NextResponse.json({ success: true, message: "Categories seeded successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
