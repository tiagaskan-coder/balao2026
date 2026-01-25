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

const CATEGORIES = [
  {
    name: "Computadores",
    icon: "Monitor",
    children: ["PCs Gamer", "PCs de Escritório"]
  },
  {
    name: "Notebooks",
    icon: "Laptop",
    children: ["Notebook Gamer", "Notebook Profissional"]
  },
  {
    name: "Hardware",
    icon: "Cpu",
    children: ["Processadores", "Placas de Vídeo", "Memória e Armazenamento"]
  },
  {
    name: "Smartphones",
    icon: "Smartphone",
    children: ["Android", "iPhone", "Smartphones Gamer", "Acessórios para Smartphones"]
  },
  {
    name: "Monitores",
    icon: "Monitor",
    children: ["Monitor Gamer", "Monitor Profissional"]
  },
  {
    name: "Periféricos",
    icon: "Keyboard",
    children: ["Teclados", "Mouses", "Headsets"]
  },
  {
    name: "Acessórios",
    icon: "Plug",
    children: ["Cabos e Adaptadores", "Suportes e Bases"]
  },
  {
    name: "Segurança",
    icon: "Shield",
    children: ["Câmeras de Segurança", "DVR / NVR", "Alarmes", "Fechaduras Eletrônicas"]
  },
  {
    name: "Automação",
    icon: "Home",
    children: ["Casa Inteligente", "Tomadas Inteligentes", "Lâmpadas Inteligentes", "Assistentes Virtuais"]
  },
  {
    name: "Geek",
    icon: "Ghost",
    children: ["Action Figures", "Colecionáveis", "Decoração Geek", "Vestuário Geek"]
  },
  {
    name: "Licenças",
    icon: "Key",
    children: ["Windows", "Office", "Antivírus"]
  },
  {
    name: "Escritório",
    icon: "Armchair",
    children: ["Cadeiras", "Mesas"]
  },
  {
    name: "Games",
    icon: "Gamepad",
    children: ["Jogos", "Consoles", "Gift Cards"]
  },
  {
    name: "Apple",
    icon: "Apple",
    children: ["Mac", "iPhone", "iPad", "Acessórios"]
  },
  {
    name: "Impressão",
    icon: "Printer",
    children: ["Impressoras", "Cartuchos e Toners"]
  }
];

export async function GET() {
  try {
    console.log("Starting category seed...");

    // 1. Delete all existing categories
    const { error: deleteError } = await supabaseAdmin
      .from("categories")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Hack to delete all

    if (deleteError) {
      console.error("Error deleting categories:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // 2. Insert new categories
    let displayOrder = 0;

    for (const cat of CATEGORIES) {
      // Create Parent
      const { data: parent, error: parentError } = await supabaseAdmin
        .from("categories")
        .insert({
          name: cat.name,
          slug: slugify(cat.name),
          icon: cat.icon,
          display_order: displayOrder++,
          active: true
        })
        .select()
        .single();

      if (parentError) {
        console.error(`Error creating parent ${cat.name}:`, parentError);
        continue;
      }

      // Create Children
      if (cat.children && cat.children.length > 0) {
        const childrenData = cat.children.map((childName, index) => ({
          name: childName,
          slug: slugify(`${cat.name} ${childName}`), // Include parent in slug to avoid collisions (e.g. "Acessórios")
          parent_id: parent.id,
          display_order: index,
          active: true
        }));

        const { error: childrenError } = await supabaseAdmin
          .from("categories")
          .insert(childrenData);

        if (childrenError) {
          console.error(`Error creating children for ${cat.name}:`, childrenError);
        }
      }
    }

    return NextResponse.json({ success: true, message: "Categories seeded successfully" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
