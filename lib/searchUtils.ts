
import { Product } from "@/lib/utils";

// --- 1. Normalização de Texto ---
// Remove acentos, caracteres especiais e converte para minúsculas.
export function normalizeText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9\s]/g, "") // Remove chars especiais, mantendo letras, números e espaços
    .trim();
}

// --- 2. Tratamento de Sinônimos ---
// Mapeia termos equivalentes para expandir a busca
const SYNONYMS: Record<string, string[]> = {
  "hd": ["disco rigido", "hard disk", "hdd"],
  "disco rigido": ["hd", "hard disk", "hdd"],
  "ssd": ["solid state drive", "armazenamento"],
  "fonte": ["psu", "fonte de alimentacao"],
  "psu": ["fonte", "fonte de alimentacao"],
  "video": ["gpu", "placa de video", "grafica"],
  "gpu": ["placa de video", "video", "rtx", "gtx", "rx"],
  "placa de video": ["gpu", "video", "vga"],
  "memoria": ["ram", "memoria ram"],
  "ram": ["memoria", "memoria ram"],
  "processador": ["cpu"],
  "cpu": ["processador"],
  "mobo": ["placa mae", "motherboard"],
  "placa mae": ["mobo", "motherboard"],
  "motherboard": ["mobo", "placa mae"],
  "gabinete": ["case", "torre"],
  "case": ["gabinete", "torre"],
  "cooler": ["fan", "ventoinha"],
  "fan": ["cooler", "ventoinha"],
  "wifi": ["wi-fi", "wireless", "sem fio"],
  "wi-fi": ["wifi", "wireless", "sem fio"]
};

function expandSearchTerms(term: string): string[] {
  const normalized = normalizeText(term);
  const terms = [normalized];
  
  // Verifica se o termo exato tem sinônimos
  if (SYNONYMS[normalized]) {
    terms.push(...SYNONYMS[normalized]);
  }
  
  // Verifica palavras individuais (ex: "fonte corsair" -> expande "fonte" para "psu")
  const words = normalized.split(/\s+/);
  words.forEach(word => {
    if (SYNONYMS[word]) {
      SYNONYMS[word].forEach(syn => {
        if (!terms.includes(syn)) terms.push(syn);
      });
    }
  });

  return terms;
}

// --- 3. Fuzzy Search (Levenshtein Distance) ---
// Calcula o número de edições para transformar 'a' em 'b'
export function levenshteinDistance(a: string, b: string): number {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substituição
          Math.min(
            matrix[i][j - 1] + 1, // inserção
            matrix[i - 1][j] + 1 // remoção
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Verifica se 'query' está contido em 'target' com tolerância a erros
function fuzzyMatch(target: string, query: string, tolerance: number = 2): boolean {
  const normTarget = normalizeText(target);
  const normQuery = normalizeText(query);

  // 1. Match exato ou substring (rápido)
  if (normTarget.includes(normQuery)) return true;

  // 2. Levenshtein (se a query for curta, tolerância menor)
  // Se a query for muito curta (<= 3 chars), exige match exato ou substring
  if (normQuery.length <= 3) return false;

  // Verifica palavra por palavra do alvo para ver se alguma bate com a query
  const targetWords = normTarget.split(/\s+/);
  
  return targetWords.some(word => {
    // Se a palavra for muito diferente em tamanho, nem calcula
    if (Math.abs(word.length - normQuery.length) > tolerance) return false;
    
    const dist = levenshteinDistance(word, normQuery);
    return dist <= tolerance;
  });
}

// --- 4. Algoritmo de Busca Principal ---

export interface SearchResult<T> {
  item: T;
  score: number; // Maior é melhor
}

export function searchProducts<T extends Product>(
  products: T[], 
  query: string,
  options: {
    threshold?: number // Distância máxima (agora controlada internamente, mas mantido p/ compat)
  } = {}
): T[] {
  if (!query) return products;

  const terms = expandSearchTerms(query);
  const primaryTerm = normalizeText(query);
  
  const results: SearchResult<T>[] = products.map(product => {
    let score = 0;
    const name = normalizeText(product.name);
    const category = normalizeText(product.category);
    // Assumindo que pode haver tags ou specs
    const specs = product.specs ? Object.values(product.specs).join(" ") : "";
    const normSpecs = normalizeText(specs);

    // Estratégia de Pontuação:
    
    // 1. Match Exato no Nome (Peso Alto)
    if (name.includes(primaryTerm)) score += 10;
    
    // 2. Match Exato na Categoria (Peso Médio)
    if (category.includes(primaryTerm)) score += 5;

    // 3. Match Exato nas Specs/Tags (Peso Baixo)
    if (normSpecs.includes(primaryTerm)) score += 3;

    // 4. Fuzzy Match e Sinônimos
    terms.forEach(term => {
        if (term === primaryTerm) return; // Já verificado acima

        if (name.includes(term)) score += 8; // Sinônimo no nome
        else if (fuzzyMatch(name, term)) score += 6; // Typos no nome

        if (category.includes(term)) score += 4; // Sinônimo na categoria
        
        if (normSpecs.includes(term)) score += 2;
    });

    // Fuzzy Search no termo principal se não houve match exato
    if (score === 0) {
        if (fuzzyMatch(name, primaryTerm)) score += 5;
        if (fuzzyMatch(category, primaryTerm)) score += 3;
    }

    return { item: product, score };
  });

  // Filtrar itens com score > 0 e ordenar por relevância
  return results
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(r => r.item);
}
