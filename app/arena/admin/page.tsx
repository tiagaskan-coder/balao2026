import { getVendedores, getConfig, getEventosMidia } from '../actions';
import AdminClient from './AdminClient';

// Força renderização dinâmica pois depende de dados do banco que mudam
export const dynamic = 'force-dynamic';

export default async function ArenaAdminPage() {
  const [vendedores, config, eventosMidia] = await Promise.all([
    getVendedores(),
    getConfig(),
    getEventosMidia()
  ]);

  return (
    <AdminClient 
      vendedoresIniciais={vendedores} 
      configInicial={config} 
      eventosMidiaIniciais={eventosMidia}
    />
  );
}
