import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Serviços e Ofertas | Balão da Informática',
  description:
    'Assistência técnica e upgrades em Campinas: mão de obra, clone de disco, atualização de BIOS, upgrades de SSD e memória, reparo de carcaça e muito mais. Preços justos e atendimento rápido.',
  alternates: { canonical: '/servicos-e-ofertas' },
  openGraph: {
    title: 'Serviços e Ofertas | Balão da Informática',
    description:
      'Especialistas em manutenção e upgrades. Mão de obra a partir de R$ 149, clone de disco, BIOS, SSD, memória e reparo de carcaça. Campinas e região.',
    url: '/servicos-e-ofertas',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Serviços e Ofertas | Balão da Informática',
    description:
      'Manutenção, upgrades e promoções de informática em Campinas. Atendimento rápido e com garantia.'
  },
  robots: { index: true, follow: true }
}

const heroCtas = [
  { label: 'Chamar no WhatsApp', href: '/contato' },
  { label: 'Visitar Loja Física', href: '/contato' }
]

const principaisServicos = [
  {
    titulo: 'Mão de Obra a partir de R$ 149,00',
    destaque: 'Diagnóstico honesto e reparo com garantia',
    texto:
      'Atendimento técnico completo: montagem, desmontagem, limpeza, troca de peças, reinstalação de sistemas e ajustes finos. Processo transparente do início ao fim, com orçamento antes de qualquer intervenção.'
  },
  {
    titulo: 'Clone de Disco a partir de R$ 249,00',
    destaque: 'Migração fiel do seu sistema e arquivos',
    texto:
      'Cópia setor a setor do HD/SSD antigo para um novo SSD rápido, preservando Windows, programas, licenças e dados. Ideal para trocar HD lento por SSD sem precisar reinstalar tudo.'
  },
  {
    titulo: 'Atualização de BIOS a partir de R$ 249,00',
    destaque: 'Compatibilidade e estabilidade para seu hardware',
    texto:
      'Atualizamos a BIOS com segurança para suportar novas CPUs, corrigir bugs e melhorar estabilidade. Inclui verificação de versão, preparo de mídia, atualização e testes de funcionamento.'
  },
  {
    titulo: 'Upgrade de SSD e Memória a partir de R$ 499,00',
    destaque: 'Velocidade e multitarefa em nível profissional',
    texto:
      'Troque para SSD NVMe ou SATA e aumente memória para abrir programas instantaneamente, inicializar em segundos e trabalhar com mais abas e aplicativos sem travar. Instalação, configuração e otimização inclusas.'
  },
  {
    titulo: 'Reparo de Carcaça de Notebook a partir de R$ 249,00',
    destaque: 'Estrutura reforçada e ajustes de dobradiças',
    texto:
      'Correção de trincas e quebras, substituição de tampa/base, reforço de fixações e alinhamento de dobradiças. Reduz ruídos, folgas e riscos de danos internos por desalinhamento.'
  }
]

const promocoesBaratas = [
  { nome: 'Mouse Óptico USB', preco: 'R$ 19,90' },
  { nome: 'Mouse Pad Antiderrapante', preco: 'R$ 9,90' },
  { nome: 'Cabo HDMI 1.5m', preco: 'R$ 24,90' },
  { nome: 'Cabo USB-C 1m', preco: 'R$ 19,90' },
  { nome: 'Pen Drive 16GB', preco: 'R$ 24,90' },
  { nome: 'Teclado USB Slim', preco: 'R$ 39,90' },
  { nome: 'Adaptador Wi‑Fi USB', preco: 'R$ 49,90' },
  { nome: 'Headset Básico P2', preco: 'R$ 39,90' },
  { nome: 'Suporte para Notebook', preco: 'R$ 29,90' },
  { nome: 'Cabo de Rede 5m', preco: 'R$ 19,90' }
]

const maisDe50Servicos = [
  'Formatação com backup',
  'Limpeza interna e troca de pasta térmica',
  'Instalação do Windows com drivers',
  'Remoção de vírus e otimizações',
  'Montagem de PC sob medida',
  'Testes de estabilidade e estresse',
  'Troca de HD/SSD',
  'Instalação de NVMe com heatsink',
  'Expansão de memória RAM',
  'Configuração de dual channel',
  'Instalação de pacote Office',
  'Configuração de e‑mail profissional',
  'Upgrade de placa de vídeo',
  'Fonte e cabeamento organizado',
  'Troca de bateria de notebook',
  'Troca de tela de notebook',
  'Troca de teclado de notebook',
  'Troca de carregador DC‑Jack',
  'Reballing e reflow (análise)',
  'Reparo em placas lógicas (análise)',
  'Solda SMD e troca de conectores',
  'Correção de BIOS corrompida',
  'Configuração de RAID',
  'Servidor de arquivos local',
  'NAS e backup automático',
  'Configuração de roteadores e Wi‑Fi',
  'Ampliação de sinal com repetidores',
  'Cabeamento estruturado básico',
  'Crimpagem de cabos RJ45',
  'Firewalls e segurança básica',
  'VPN site‑to‑site (análise)',
  'Compartilhamento de impressoras',
  'Implantação de impressoras de rede',
  'Manutenção de impressoras (básica)',
  'Migração para contas Microsoft',
  'OneDrive e Google Drive',
  'Configuração de backup em nuvem',
  'Restauração de backup',
  'Recuperação de dados (análise)',
  'Clonagem avançada com ajuste de partições',
  'Criação de pendrive bootável',
  'Teste de memória e armazenamento',
  'Teste de GPU e CPU',
  'Ajuste de curva de ventoinhas',
  'Undervolt/overclock seguro (análise)',
  'Calibração de cores de monitor',
  'Suporte remoto',
  'Inventário de máquinas',
  'Higienização de PCs corporativos',
  'Política de senhas e usuários',
  'Antivírus corporativo (implantação)',
  'Ponto de acesso e captive portal (análise)',
  'Consultoria para compra de hardware',
  'Laudo técnico e orçamento detalhado'
]

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="w-full bg-red-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Serviços e Ofertas
          </h1>
          <p className="mt-4 text-xl md:text-2xl max-w-3xl">
            Performance, transparência e garantia em Campinas e região. Seu computador novo de novo, com preço justo.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {heroCtas.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="px-6 py-3 rounded-xl bg-white text-red-700 hover:bg-red-50 font-bold"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full">
        {principaisServicos.map((s, idx) => (
          <div
            key={s.titulo}
            className={`${idx % 2 === 0 ? 'bg-white text-black' : 'bg-red-50 text-red-900'} w-full`}
          >
            <div className="mx-auto max-w-7xl px-4 py-14 md:py-16">
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                {s.titulo}
              </h2>
              <p className="mt-2 text-lg md:text-2xl font-bold">{s.destaque}</p>
              <p className="mt-3 text-base md:text-lg max-w-4xl">{s.texto}</p>
              <div className="mt-6">
                <Link
                  href="/contato"
                  className={`inline-block rounded-xl px-6 py-3 font-semibold ${idx % 2 === 0 ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-700 text-white hover:bg-red-800'}`}
                >
                  Pedir Orçamento
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="w-full bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 md:py-16">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-red-700">
            Gráficos de Resultado
          </h2>
          <p className="mt-2 text-lg md:text-xl text-slate-700">
            Ganho real de velocidade e confiabilidade após nossos serviços.
          </p>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="border rounded-2xl p-6">
              <div className="text-lg font-bold text-red-700">Tempo de Inicialização</div>
              <div className="mt-3 h-2 w-full bg-slate-200 rounded-full">
                <div className="h-2 bg-red-600 rounded-full" style={{ width: '25%' }} />
              </div>
              <div className="mt-2 text-sm text-slate-600">Antes: 100% • Depois: 25%</div>
            </div>
            <div className="border rounded-2xl p-6">
              <div className="text-lg font-bold text-red-700">Abertura de Aplicativos</div>
              <div className="mt-3 h-2 w-full bg-slate-200 rounded-full">
                <div className="h-2 bg-red-600 rounded-full" style={{ width: '35%' }} />
              </div>
              <div className="mt-2 text-sm text-slate-600">Antes: 100% • Depois: 35%</div>
            </div>
            <div className="border rounded-2xl p-6">
              <div className="text-lg font-bold text-red-700">Transferência de Arquivos</div>
              <div className="mt-3 h-2 w-full bg-slate-200 rounded-full">
                <div className="h-2 bg-red-600 rounded-full" style={{ width: '30%' }} />
              </div>
              <div className="mt-2 text-sm text-slate-600">Antes: 100% • Depois: 30%</div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-red-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 md:py-16">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Por que escolher o Balão?
          </h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="text-2xl font-black">Garantia Real</div>
              <p className="mt-2 text-white/90">Serviço com nota, garantia local e acompanhamento.</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="text-2xl font-black">Atendimento Rápido</div>
              <p className="mt-2 text-white/90">Diagnóstico ágil e comunicação clara em cada etapa.</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="text-2xl font-black">Transparência</div>
              <p className="mt-2 text-white/90">Orçamento antes de intervir e peças de procedência.</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="text-2xl font-black">Consultoria</div>
              <p className="mt-2 text-white/90">Recomendamos upgrades com melhor custo‑benefício.</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="text-2xl font-black">Testes Rigorosos</div>
              <p className="mt-2 text-white/90">Validação térmica e de estabilidade após cada serviço.</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="text-2xl font-black">Campinas e Região</div>
              <p className="mt-2 text-white/90">Entrega/retirada ágil e suporte local.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 md:py-16">
          <div className="flex items-baseline justify-between">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-red-700">
              Promoções
            </h2>
            <span className="text-slate-600 text-sm md:text-base">Uma fileira com 10 produtos de preço baixo</span>
          </div>
          <div className="mt-6 overflow-x-auto">
            <div className="flex gap-4 md:gap-6 min-w-max">
              {promocoesBaratas.map((p) => (
                <div
                  key={p.nome}
                  className="w-64 shrink-0 rounded-2xl border border-red-200 bg-white p-4 shadow-sm"
                >
                  <div className="h-28 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-400 text-sm">
                    Imagem
                  </div>
                  <div className="mt-3">
                    <div className="font-semibold line-clamp-2">{p.nome}</div>
                    <div className="text-3xl font-black text-red-600 mt-1">{p.preco}</div>
                  </div>
                  <Link
                    href="/contato"
                    className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-red-600 text-white font-bold py-2 hover:bg-red-700"
                  >
                    Quero Aproveitar
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-red-50">
        <div className="mx-auto max-w-7xl px-4 py-14 md:py-16">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-red-700">
            Mais de 50 serviços em TI e Informática
          </h2>
          <p className="mt-3 text-slate-700 text-base md:text-lg">
            Residencial, corporativo e home office, com processos ágeis e garantia.
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {maisDe50Servicos.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-red-200 bg-white px-4 py-3 text-slate-800 text-sm md:text-base"
              >
                {item}
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href="/contato"
              className="inline-block rounded-2xl px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-lg"
            >
              Falar com um Especialista
            </Link>
          </div>
        </div>
      </section>

      <section className="w-full bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-16">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-10">
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-red-700">Onde estamos</h3>
            <p className="mt-2 text-slate-700">
              Av. Anchieta, 789 — Campinas, SP. Atendimento rápido para Campinas e região.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/contato"
                className="px-5 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold"
              >
                Como Chegar
              </Link>
              <Link
                href="/contato"
                className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                Solicitar Orçamento
              </Link>
            </div>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Balão da Informática',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Av. Anchieta, 789',
              addressLocality: 'Campinas',
              addressRegion: 'SP',
              addressCountry: 'BR'
            },
            url: '/servicos-e-ofertas',
            areaServed: 'Campinas e região',
            sameAs: []
          })
        }}
      />
    </main>
  )
}
