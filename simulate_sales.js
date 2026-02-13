
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (substitua pelas chaves reais se necessário, ou use vars de ambiente)
// Como estamos no ambiente local, vou tentar ler do .env se possível, ou usar placeholders
// O ideal é o usuário fornecer as chaves, mas vou assumir que posso usar as do projeto se estiverem acessíveis.
// Mas para um script standalone, é melhor pedir input ou usar as conhecidas.

// Como não tenho as chaves aqui, vou criar um script que pede as chaves ou assume que o usuário vai rodar com as env vars carregadas.
// Melhor: Vou criar um script que roda dentro do contexto do Next.js ou usa as vars se estiverem no .env.local

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Precisa de service role para criar vendas como admin se RLS bloquear

if (!supabaseUrl || !supabaseKey) {
  console.error("Erro: Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias.");
  console.log("Exemplo de uso: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node simulate_sales.js");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const VENDEDORES = [
  'João Silva', 'Maria Souza', 'Pedro Santos', 'Ana Oliveira'
];

async function getOrCreateSeller(nome) {
  const { data: existing } = await supabase.from('vendedores').select('*').eq('nome', nome).single();
  if (existing) return existing;
  
  const { data: newSeller } = await supabase.from('vendedores').insert({
    nome,
    meta_valor: 5000
  }).select().single();
  return newSeller;
}

async function simulate() {
  console.log("Iniciando simulação de vendas...");
  
  // 1. Garantir vendedores
  const sellers = await Promise.all(VENDEDORES.map(getOrCreateSeller));
  console.log(`Vendedores prontos: ${sellers.map(s => s.nome).join(', ')}`);

  // Função helper para criar venda
  const createSale = async (seller, valor, isGoogle = false, delayMs = 1000) => {
    console.log(`Simulando venda para ${seller.nome}: R$ ${valor} ${isGoogle ? '(Google Bonus)' : ''}`);
    await supabase.from('vendas').insert({
      vendedor_id: seller.id,
      valor,
      is_google_bonus: isGoogle
    });
    await new Promise(r => setTimeout(r, delayMs));
  };

  // Cenário 1: Venda Comum (deve disparar "Sale")
  await createSale(sellers[0], 500);

  // Cenário 2: Big Sale (deve disparar "Big Sale")
  await createSale(sellers[1], 3500, false, 3000);

  // Cenário 3: Google Bonus (deve disparar "Google")
  await createSale(sellers[2], 1000, true, 3000);

  // Cenário 4: Combo (2 vendas rápidas do mesmo vendedor)
  // Venda 1
  await createSale(sellers[3], 200, false, 100);
  // Venda 2 (deve disparar "Combo")
  await createSale(sellers[3], 300, false, 3000);

  // Cenário 5: Bounty (Valor múltiplo de 500)
  await createSale(sellers[0], 1500, false, 3000);

  console.log("Simulação concluída. Verifique o painel da Arena.");
}

simulate().catch(console.error);
