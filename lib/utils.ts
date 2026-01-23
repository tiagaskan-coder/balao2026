export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  slug: string;
}

export interface CarouselImage {
  id: string;
  image_url: string;
  title?: string;
  display_order: number;
  active: boolean;
  created_at: string;
}

export const CATEGORIES = [
  "Todos os Produtos",
  "Hardware",
  "PC Gamer",
  "PC Office",
  "Notebooks",
  "Monitores",
  "Placa de Vídeo",
  "Apple",
  "Acessórios",
  "Smart TV",
  "Rede",
  "Impressoras",
  "Casa Inteligente",
  "Smartphone",
  "Áudio",
];

export function parseProducts(text: string): Product[] {
  const products: Product[] = [];
  // Regex explanation:
  // (https?:\/\/[^\s]+\.(?:jpg|png|jpeg|webp|gif)) -> Capture Group 1: Image URL
  // \s+ -> Whitespace
  // (.+?) -> Capture Group 2: Product Name (non-greedy)
  // \s+ -> Whitespace
  // (R\$\s*[\d\.,]+) -> Capture Group 3: Price
  const regex = /(https?:\/\/[^\s]+)\s+(.+?)\s+(R\$\s*[\d\.,]+)/g;
  
  let match;
  while ((match = regex.exec(text)) !== null) {
    const image = match[1];
    const name = match[2].trim();
    const price = match[3];

    // Clean up the image URL if it has extra garbage (though regex [^\s]+ should handle it)
    // Clean up name if it captured too much (unlikely with non-greedy + following price)
    
    // Generate a simple ID and slug
    const id = Math.random().toString(36).substring(2, 9);
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    products.push({
      id,
      name,
      price,
      image,
      category: "Hardware", // Default category as we don't have it in the input
      slug,
    });
  }
  
  return products;
}
