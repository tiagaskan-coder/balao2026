import { getVendedores, getConfig } from '../actions';
import AdminClient from './AdminClient';

// Força renderização dinâmica pois depende de dados do banco que mudam
export const dynamic = 'force-dynamic';

export default async function ArenaAdminPage() {
  const [vendedores, config] = await Promise.all([
    getVendedores(),
    getConfig()
  ]);

  return (
    <AdminClient 
      vendedoresIniciais={vendedores} 
      configInicial={config} 
    />
  );
}
