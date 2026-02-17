import { getVendedores, getConfig, getEventosMidia } from './actions';
import ArenaClient from './ArenaClient';

// Força renderização dinâmica
export const dynamic = 'force-dynamic';

export default async function ArenaPage() {
  const [vendedores, config, eventos] = await Promise.all([
    getVendedores(),
    getConfig(),
    getEventosMidia()
  ]);

  return (
    <ArenaClient 
      vendedoresIniciais={vendedores} 
      configInicial={config} 
      eventosIniciais={eventos}
    />
  );
}
