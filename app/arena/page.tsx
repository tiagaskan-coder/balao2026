import { getVendedores, getConfig } from './actions';
import ArenaClient from './ArenaClient';

// Força renderização dinâmica
export const dynamic = 'force-dynamic';

export default async function ArenaPage() {
  const [vendedores, config] = await Promise.all([
    getVendedores(),
    getConfig()
  ]);

  return (
    <ArenaClient 
      vendedoresIniciais={vendedores} 
      configInicial={config} 
    />
  );
}
