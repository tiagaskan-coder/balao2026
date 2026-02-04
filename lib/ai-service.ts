
import { Product } from "./utils";

export interface AIEnrichmentResult {
    specs: Record<string, string>;
    description: string;
    source: string;
    confidence: number;
}

/**
 * Simula um serviço de IA que busca informações de produtos.
 * Em produção, isso chamaria a API da OpenAI/Gemini/Anthropic.
 */
export async function enrichProductWithAI(productName: string): Promise<AIEnrichmentResult> {
    // Simula delay de rede/processamento
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (!productName) {
        throw new Error("Product name is required");
    }

    const lowerName = productName.toLowerCase();
    
    // Base de Conhecimento Mockada (Simulando o que a LLM "sabe")
    let specs: Record<string, string> = {};
    let description = "";

    if (lowerName.includes("iphone") || lowerName.includes("apple")) {
        specs = {
            "Sistema Operacional": "iOS",
            "Armazenamento": lowerName.includes("128gb") ? "128 GB" : (lowerName.includes("256gb") ? "256 GB" : "Variável"),
            "Processador": "A15 Bionic ou superior",
            "Conectividade": "5G, Wi-Fi 6, Bluetooth 5.3",
            "Câmera": "12MP (Grande-angular e Ultra-angular)",
            "Resistência": "IP68 (água e poeira)"
        };
        description = "Smartphone Apple com design elegante, desempenho excepcional e câmeras avançadas. Ideal para quem busca integração total com o ecossistema Apple.";
    } else if (lowerName.includes("notebook") || lowerName.includes("laptop") || lowerName.includes("dell") || lowerName.includes("lenovo")) {
        specs = {
            "Processador": lowerName.includes("i5") ? "Intel Core i5" : (lowerName.includes("i7") ? "Intel Core i7" : "Intel/AMD"),
            "Memória RAM": lowerName.includes("8gb") ? "8 GB" : (lowerName.includes("16gb") ? "16 GB" : "8 GB"),
            "Armazenamento": "SSD NVMe",
            "Tela": "Full HD (1920x1080) Antirreflexo",
            "Sistema Operacional": "Windows 11 Home"
        };
        description = "Notebook de alta performance para produtividade e entretenimento. Design fino e leve com bateria de longa duração.";
    } else if (lowerName.includes("monitor") || lowerName.includes("samsung") || lowerName.includes("lg")) {
        specs = {
            "Resolução": lowerName.includes("4k") ? "4K UHD" : "Full HD",
            "Taxa de Atualização": lowerName.includes("144hz") ? "144 Hz" : "60 Hz / 75 Hz",
            "Painel": "IPS",
            "Tempo de Resposta": "1ms (GtG)",
            "Conexões": "HDMI, DisplayPort"
        };
        description = "Monitor com qualidade de imagem superior e cores vibrantes. Perfeito para trabalho, estudos ou jogos.";
    } else if (lowerName.includes("playstation") || lowerName.includes("ps5")) {
        specs = {
            "CPU": "AMD Zen 2 8-core",
            "GPU": "AMD RDNA 2 10.3 TFLOPS",
            "Memória": "16GB GDDR6",
            "Armazenamento": "SSD 825GB",
            "Resolução": "Até 8K (4K @ 120Hz)"
        };
        description = "Console de nova geração da Sony. Experimente carregamento ultrarrápido e imersão profunda com feedback tátil.";
    } else {
        // Fallback genérico inteligente
        specs = {
            "Categoria": "Eletrônicos",
            "Garantia": "12 Meses",
            "Estado": "Novo",
            "Disponibilidade": "Imediata"
        };
        description = `Produto de alta qualidade da categoria de eletrônicos. ${productName} oferece excelente custo-benefício e durabilidade.`;
    }

    return {
        specs,
        description,
        source: "AI Knowledge Base (Simulated Kabum/ML Search)",
        confidence: 0.95
    };
}
