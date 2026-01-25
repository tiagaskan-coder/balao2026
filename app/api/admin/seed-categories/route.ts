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
      { name: "Notebook Gamer", icon: "Gamepad2" },
      { name: "Notebook Profissional", icon: "Briefcase" },
      { name: "Notebook Estudante", icon: "Book" },
      { name: "Ultrabook", icon: "Feather" },
      { name: "MacBook", slug: "macbook-notebooks", icon: "Laptop" }
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
    name: "Smartphones",
    icon: "Smartphone",
    children: [
      { name: "Smartphones Android", icon: "Smartphone" },
      { name: "iPhone", slug: "iphone-smartphones", icon: "Smartphone" },
      { name: "Smartphones Gamer", icon: "Gamepad2" },
      { name: "Capas e Películas", icon: "Shield" },
      { name: "Carregadores e Cabos", slug: "carregadores-cabos-smartphones", icon: "Zap" },
      { name: "Suportes e Power Banks", icon: "Battery" }
    ]
  },
  {
    name: "Monitores",
    icon: "Monitor",
    children: [
      { name: "Monitor Gamer", icon: "Gamepad2" },
      { name: "Monitor Curvo", icon: "Monitor" },
      { name: "Monitor Profissional", icon: "Briefcase" },
      { name: "Monitor Ultrawide", icon: "Monitor" },
      { name: "Monitor 4K", icon: "Monitor" },
      { name: "Suportes para Monitor", icon: "Move" }
    ]
  },
  {
    name: "Periféricos",
    icon: "Keyboard",
    children: [
      { name: "Teclados Gamer e Mecânicos", icon: "Keyboard" },
      { name: "Mouses Gamer", icon: "Mouse" },
      { name: "Headsets e Fones", icon: "Headphones" },
      { name: "Mousepads", icon: "Square" },
      { name: "Controles / Joysticks", icon: "Gamepad" },
      { name: "Volantes e Simuladores", icon: "Disc" },
      { name: "Webcams", icon: "Camera" },
      { name: "Microfones", icon: "Mic" }
    ]
  },
  {
    name: "Acessórios",
    icon: "Plug",
    children: [
      { name: "Cabos (HDMI, DisplayPort, USB, Áudio)", icon: "Cable" },
      { name: "Adaptadores e Conversores", icon: "RefreshCcw" },
      { name: "Hubs USB", icon: "Usb" },
      { name: "Bases para Notebook", icon: "Laptop" },
      { name: "Suportes para Headset", icon: "Headphones" },
      { name: "Mochilas e Cases", icon: "Backpack" },
      { name: "Iluminação RGB", icon: "Lightbulb" },
      { name: "Filtros de Linha e Estabilizadores", icon: "Zap" }
    ]
  },
  {
    name: "Segurança",
    icon: "Lock",
    children: [
      { name: "Câmeras de Segurança (IP / Wi‑Fi)", icon: "Video" },
      { name: "Kits CFTV", icon: "Video" },
      { name: "DVR e NVR", icon: "HardDrive" },
      { name: "Alarmes Residenciais", icon: "Bell" },
      { name: "Sensores de Movimento", icon: "Radio" },
      { name: "Fechaduras Eletrônicas", icon: "Lock" },
      { name: "Vídeo Porteiros", icon: "Video" }
    ]
  },
  {
    name: "Automação",
    icon: "Home",
    children: [
      { name: "Casa Inteligente", icon: "Home" },
      { name: "Tomadas Inteligentes", icon: "Power" },
      { name: "Interruptores Inteligentes", icon: "ToggleLeft" },
      { name: "Lâmpadas e Fitas LED Smart", icon: "Lightbulb" },
      { name: "Sensores Inteligentes", icon: "Radio" },
      { name: "Assistentes Virtuais", icon: "Mic" },
      { name: "Centrais de Automação", icon: "Server" }
    ]
  },
  {
    name: "Geek",
    icon: "Ghost",
    children: [
      { name: "Action Figures", icon: "User" },
      { name: "Colecionáveis", icon: "Star" },
      { name: "Funko Pop", icon: "Smile" },
      { name: "Camisetas e Vestuário", icon: "Shirt" },
      { name: "Canecas e Copos", icon: "Coffee" },
      { name: "Decoração Geek", icon: "Image" },
      { name: "Brinquedos Temáticos", icon: "Gift" }
    ]
  },
  {
    name: "Licenças",
    icon: "Key",
    children: [
      { name: "Windows", icon: "Monitor" },
      { name: "Microsoft Office", icon: "FileText" },
      { name: "Antivírus", icon: "Shield" },
      { name: "Softwares de Design", icon: "PenTool" },
      { name: "Softwares de Edição", icon: "Video" }
    ]
  },
  {
    name: "Escritório",
    icon: "Armchair",
    children: [
      { name: "Cadeiras Gamer", icon: "Armchair" },
      { name: "Cadeiras Ergonômicas", icon: "Armchair" },
      { name: "Mesas Gamer", icon: "Table" },
      { name: "Mesas para Escritório", icon: "Table" },
      { name: "Suportes Ergonômicos", icon: "Move" },
      { name: "Organizadores", icon: "Box" }
    ]
  },
  {
    name: "Games",
    icon: "Gamepad",
    children: [
      { name: "Jogos para PC", icon: "Monitor" },
      { name: "Jogos para PlayStation", icon: "Gamepad" },
      { name: "Jogos para Xbox", icon: "Gamepad" },
      { name: "Jogos para Nintendo", icon: "Gamepad" },
      { name: "Consoles", icon: "Tv" },
      { name: "Controles", slug: "controles-games", icon: "Gamepad2" },
      { name: "Assinaturas", icon: "CreditCard" },
      { name: "Gift Cards", icon: "Gift" }
    ]
  },
  {
    name: "Apple",
    icon: "Apple",
    children: [
      { name: "MacBook", slug: "macbook-apple", icon: "Laptop" },
      { name: "iMac", icon: "Monitor" },
      { name: "Mac Mini", icon: "Box" },
      { name: "iPad", icon: "Tablet" },
      { name: "iPhone", slug: "iphone", icon: "Smartphone" },
      { name: "Apple Watch", icon: "Watch" },
      { name: "AirPods", icon: "Headphones" },
      { name: "Acessórios Apple", icon: "Plug" }
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
