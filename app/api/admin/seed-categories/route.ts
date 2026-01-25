import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Helper to create slugs
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

type CategoryChild = string | { name: string; slug?: string; icon?: string };

type Category = {
  name: string;
  icon: string;
  children: CategoryChild[];
};

const CATEGORIES: Category[] = [
  {
    name: "Computadores",
    icon: "Monitor",
    children: [
      { name: "PC Gamer", icon: "Gamepad2" },
      { name: "PC Corporativo / Escritório", icon: "Briefcase" },
      { name: "Workstation", icon: "Server" },
      { name: "All‑in‑One", icon: "Monitor" },
      { name: "Mini PC", icon: "Box" }
    ]
  },
  {
    name: "Notebooks",
    icon: "Laptop",
    children: [
      { name: "Notebooks Gamer", icon: "Gamepad2" },
      { name: "Ultrabook", icon: "Feather" },
      { name: "MacBook", slug: "macbook-notebooks", icon: "Laptop" },
      { name: "Notebooks para Trabalho", icon: "Briefcase" },
      { name: "Chromebook", icon: "Globe" },
      { name: "Acessórios para Notebook", icon: "Plug" }
    ]
  },
  {
    name: "Hardware",
    icon: "Cpu",
    children: [
      { name: "Processadores (CPU)", icon: "Cpu" },
      { name: "Placas de Vídeo (GPU)", icon: "Aperture" },
      { name: "Placas‑Mãe", icon: "CircuitBoard" },
      { name: "Memória RAM", icon: "MemoryStick" },
      { name: "SSD / HD / NVMe", icon: "HardDrive" },
      { name: "Fontes de Alimentação", icon: "Zap" },
      { name: "Gabinetes", icon: "Box" },
      { name: "Coolers e Water Cooler", icon: "Fan" },
      { name: "Placas de Rede / Som", icon: "Network" }
    ]
  },
  {
    name: "Periféricos",
    icon: "Keyboard",
    children: [
      { name: "Mouse e Mousepad", icon: "Mouse" },
      { name: "Teclados", icon: "Keyboard" },
      { name: "Headsets e Fones", icon: "Headphones" },
      { name: "Microfones", icon: "Mic" },
      { name: "Webcams", icon: "Camera" },
      { name: "Caixas de Som", icon: "Speaker" },
      { name: "Controles e Joysticks", icon: "Gamepad" },
      { name: "Hubs USB", icon: "Usb" },
      { name: "Mesas Digitalizadoras", icon: "PenTool" }
    ]
  },
  {
    name: "Monitores",
    icon: "Monitor",
    children: [
      { name: "Monitores Gamer", icon: "Gamepad2" },
      { name: "Monitores 4K / Ultrawide", icon: "Monitor" },
      { name: "Monitores para Escritório", icon: "Briefcase" },
      { name: "Suportes para Monitor", icon: "Move" },
      { name: "Acessórios de Vídeo", icon: "Cable" }
    ]
  },
  {
    name: "Cadeiras e Escritório",
    icon: "Armchair",
    children: [
      { name: "Cadeiras Gamer", icon: "Armchair" },
      { name: "Cadeiras de Escritório", icon: "Briefcase" },
      { name: "Mesas Gamer / Escritório", icon: "Table" },
      { name: "Iluminação e LED", icon: "Lightbulb" },
      { name: "Organização de Cabos", icon: "Cable" }
    ]
  },
  {
    name: "Redes e Conectividade",
    icon: "Wifi",
    children: [
      { name: "Roteadores Wi‑Fi e Mesh", icon: "Wifi" },
      { name: "Repetidores de Sinal", icon: "Signal" },
      { name: "Switch e Hubs", icon: "Network" },
      { name: "Cabos de Rede", icon: "Cable" },
      { name: "Adaptadores USB / Wi‑Fi", icon: "Usb" },
      { name: "Modems 4G / 5G", icon: "Radio" },
      { name: "Racks e Patch Panels", icon: "Server" }
    ]
  },
  {
    name: "Servidores e Automação",
    icon: "Server",
    children: [
      { name: "Servidores Torre / Rack", icon: "Server" },
      { name: "Storage (NAS / DAS)", icon: "Database" },
      { name: "Nobreaks e Estabilizadores", icon: "Battery" },
      { name: "Automação Comercial", icon: "Store" },
      { name: "Leitores de Código de Barras", icon: "Scan" },
      { name: "Impressoras Térmicas", icon: "Printer" }
    ]
  },
  {
    name: "Games e Consoles",
    icon: "Gamepad",
    children: [
      { name: "PlayStation 5", icon: "Gamepad" },
      { name: "Xbox Series X/S", icon: "Gamepad" },
      { name: "Nintendo Switch", icon: "Gamepad" },
      { name: "Consoles Retrô", icon: "Joystick" },
      { name: "Jogos (Mídia Física)", icon: "Disc" },
      { name: "Acessórios de Console", icon: "Headphones" },
      { name: "Volantes e Simuladores", icon: "Gamepad" }
    ]
  },
  {
    name: "Apple",
    icon: "Apple",
    children: [
      { name: "iPhone", icon: "Smartphone" },
      { name: "iPad", icon: "Tablet" },
      { name: "MacBook", slug: "macbook-apple", icon: "Laptop" },
      { name: "iMac / Mac Mini", icon: "Monitor" },
      { name: "Apple Watch", icon: "Watch" },
      { name: "AirPods e Acessórios", icon: "Headphones" }
    ]
  },
  {
    name: "Smart Home",
    icon: "Home",
    children: [
      { name: "Assistentes Virtuais (Alexa/Google)", icon: "Mic" },
      { name: "Lâmpadas Inteligentes", icon: "Lightbulb" },
      { name: "Fechaduras Digitais", icon: "Lock" },
      { name: "Câmeras de Segurança", icon: "Video" },
      { name: "Sensores e Alarmes", icon: "Bell" },
      { name: "Tomadas Inteligentes", icon: "Power" },
      { name: "Robôs Aspiradores", icon: "Bot" }
    ]
  },
  {
    name: "Áudio e Vídeo",
    icon: "Speaker",
    children: [
      { name: "Soundbars e Home Theater", icon: "Speaker" },
      { name: "Caixas de Som Bluetooth", icon: "Bluetooth" },
      { name: "Projetores e Telas", icon: "Projector" },
      { name: "Cabos HDMI / Áudio", icon: "Cable" },
      { name: "Streaming (Chromecast/Fire TV)", icon: "Cast" }
    ]
  },
  {
    name: "Geek e Colecionáveis",
    icon: "Ghost",
    children: [
      { name: "Action Figures", icon: "User" },
      { name: "Funko Pop", icon: "Smile" },
      { name: "Camisetas e Vestuário", icon: "Shirt" },
      { name: "Canecas e Decoração", icon: "Coffee" },
      { name: "Mochilas e Malas", icon: "Backpack" },
      { name: "Board Games / RPG", icon: "Dices" }
    ]
  },
  {
    name: "Energia",
    icon: "Zap",
    children: [
      { name: "Nobreaks", icon: "Battery" },
      { name: "Filtros de Linha", icon: "Power" },
      { name: "Baterias e Pilhas", icon: "Battery" },
      { name: "Carregadores e Cabos", icon: "Zap" },
      { name: "Transformadores", icon: "RefreshCcw" }
    ]
  },
  {
    name: "Impressão",
    icon: "Printer",
    children: [
      { name: "Impressoras Jato de Tinta", icon: "Printer" },
      { name: "Impressoras Laser", icon: "Printer" },
      { name: "Multifuncionais", icon: "Copy" },
      { name: "Cartuchos de Tinta", icon: "Droplet" },
      { name: "Toners", icon: "Cylinder" },
      { name: "Papel Fotográfico", icon: "Image" },
      { name: "Etiquetas", icon: "Tag" },
      { name: "Scanners", icon: "Scan" }
    ]
  }
];

export async function GET() {
  try {
    // 1. Delete existing categories (optional, be careful in production)
    // await supabaseAdmin.from("categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    let displayOrder = 10;

    for (const category of CATEGORIES) {
      const parentSlug = slugify(category.name);

      // Insert parent
      const { data: parent, error: parentError } = await supabaseAdmin
        .from("categories")
        .upsert(
          {
            name: category.name,
            slug: parentSlug,
            icon: category.icon,
            display_order: displayOrder,
            parent_id: null,
          },
          { onConflict: "slug" }
        )
        .select()
        .single();

      if (parentError) {
        console.error(`Error inserting ${category.name}:`, parentError);
        continue;
      }

      displayOrder += 10;
      let childOrder = 0;

      // Insert children
      for (const child of category.children) {
        const childName = typeof child === 'string' ? child : child.name;
        const childSlug = typeof child === 'string' ? slugify(child) : (child.slug || slugify(child.name));
        const childIcon = typeof child === 'object' && child.icon ? child.icon : null;

        const { error: childError } = await supabaseAdmin
          .from("categories")
          .upsert(
            {
              name: childName,
              slug: childSlug,
              parent_id: parent.id,
              display_order: childOrder,
              icon: childIcon,
            },
            { onConflict: "slug" }
          );

        if (childError) {
          console.error(`Error inserting ${childName}:`, childError);
        }
        childOrder++;
      }
    }

    return NextResponse.json({ message: "Categories seeded successfully" });
  } catch (error) {
    console.error("Error seeding categories:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
