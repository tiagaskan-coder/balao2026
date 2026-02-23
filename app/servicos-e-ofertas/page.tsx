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
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#0b1220_0%,_#000_70%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-cyan-300 drop-shadow-[0_0_20px_rgba(0,255,255,0.35)]">
            Serviços e Ofertas
          </h1>
          <p className="mt-4 text-lg md:text-2xl text-slate-300 max-w-3xl">
            Tudo para o seu computador com preço justo, transparência e garantia. Especialistas em manutenção, upgrades e implantação para uso pessoal e corporativo em Campinas e região.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {heroCtas.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-[0_0_20px_rgba(0,255,255,0.25)]"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid gap-6 md:gap-8">
          {principaisServicos.map((s) => (
            <div
              key={s.titulo}
              className="rounded-3xl border border-cyan-500/30 bg-white/5 backdrop-blur-sm p-6 md:p-10 shadow-[0_0_40px_rgba(0,255,255,0.08)]"
            >
              <h2 className="text-3xl md:text-5xl font-extrabold text-cyan-300 tracking-tight">
                {s.titulo}
              </h2>
              <p className="mt-3 text-lg md:text-xl font-bold text-white">{s.destaque}</p>
              <p className="mt-2 text-slate-300 text-base md:text-lg">{s.texto}</p>
              <div className="mt-5">
                <Link
                  href="/contato"
                  className="inline-block rounded-xl px-5 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                >
                  Pedir Orçamento
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="flex items-baseline justify-between">
          <h2 className="text-3xl md:text-5xl font-extrabold text-yellow-300 tracking-tight drop-shadow-[0_0_20px_rgba(255,215,0,0.25)]">
            Promoções
          </h2>
          <span className="text-slate-400 text-sm md:text-base">Uma fileira com 10 produtos de preço baixo</span>
        </div>
        <div className="mt-6 overflow-x-auto">
          <div className="flex gap-4 md:gap-6 min-w-max">
            {promocoesBaratas.map((p) => (
              <div
                key={p.nome}
                className="w-56 shrink-0 rounded-2xl border border-yellow-500/30 bg-gradient-to-b from-slate-800 to-black p-4 shadow-[0_0_30px_rgba(255,215,0,0.15)]"
              >
                <div className="h-28 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center text-slate-400 text-sm">
                  Imagem
                </div>
                <div className="mt-3">
                  <div className="text-white font-semibold line-clamp-2">{p.nome}</div>
                  <div className="text-2xl md:text-3xl font-black text-yellow-300 mt-1">{p.preco}</div>
                </div>
                <Link
                  href="/contato"
                  className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-yellow-500 text-black font-bold py-2 hover:bg-yellow-400"
                >
                  Quero Aproveitar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-pink-400 drop-shadow-[0_0_20px_rgba(255,0,128,0.25)]">
          Mais de 50 serviços em TI e Informática
        </h2>
        <p className="mt-3 text-slate-300 text-base md:text-lg">
          Atendemos residências, empresas e home office, com processos ágeis, documentação e garantia.
        </p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {maisDe50Servicos.map((item) => (
            <div
              key={item}
              className="rounded-xl border border-pink-500/20 bg-white/5 px-4 py-3 text-slate-200 text-sm md:text-base"
            >
              {item}
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link
            href="/contato"
            className="inline-block rounded-2xl px-6 py-4 bg-pink-600 hover:bg-pink-500 text-white font-extrabold text-lg"
          >
            Falar com um Especialista
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-3xl border border-slate-700 bg-white/5 p-6 md:p-10">
          <h3 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">Onde estamos</h3>
          <p className="mt-2 text-slate-300">
            Av. Anchieta, 789 — Campinas, SP. Atendimento rápido para Campinas e região.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/contato"
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold"
            >
              Como Chegar
            </Link>
            <Link
              href="/contato"
              className="px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
            >
              Solicitar Orçamento
            </Link>
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

