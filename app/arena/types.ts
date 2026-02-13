export type Vendedor = {
  id: string;
  nome: string;
  avatar_url: string | null;
  veiculo_emoji: string;
  meta_valor: number;
  vendas_atual: number;
  criado_em: string;
};

export type ArenaConfig = {
  id: number;
  ativo: boolean;
  titulo: string;
  atualizado_em: string;
};

export const VEICULOS_DISPONIVEIS = [
  '🚗', '🏎️', '🚀', '🏍️', '🚚', '🚕', '🚓', '🚑', '🚜', '🛸', '🚲', '🛴'
];
