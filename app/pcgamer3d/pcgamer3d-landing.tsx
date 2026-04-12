"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  CreditCard,
  Fan,
  HardDrive,
  Lock,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Zap,
  CircuitBoard,
  MemoryStick,
} from "lucide-react";

const WHATSAPP_LINK =
  "https://wa.me/5519987510267?text=Ol%C3%A1!%20Quero%20montar%20um%20PC%20Gamer%20High-End%20Custom%20Build.%20Pode%20me%20passar%20uma%20proposta%20com%20prazo%20e%20formas%20de%20pagamento%3F";

const MODEL_ID = "44833fc6db3a43ce88be66609c1fe619";

const GALLERY = [
  {
    src: "https://images.pexels.com/photos/1714205/pexels-photo-1714205.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Gabinete de PC gamer com iluminação RGB",
  },
  {
    src: "https://images.pexels.com/photos/2582932/pexels-photo-2582932.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Interior de PC gamer com componentes premium",
  },
  {
    src: "https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Setup gamer com desktop de alta performance",
  },
  {
    src: "https://images.pexels.com/photos/4009599/pexels-photo-4009599.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Placa de vídeo e componentes em gabinete com vidro temperado",
  },
  {
    src: "https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Teclado e iluminação com estética gamer",
  },
  {
    src: "https://images.pexels.com/photos/5496464/pexels-photo-5496464.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Cabos organizados e airflow interno do PC",
  },
];

function formatTime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function pushEvent(event: string, payload: Record<string, any>) {
  if (typeof window === "undefined") return;
  const dl = (window as any).dataLayer;
  if (Array.isArray(dl)) dl.push({ event, ...payload });
}

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

function SpecCard({
  title,
  value,
  icon: Icon,
  hint,
}: {
  title: string;
  value: string;
  hint: string;
  icon: any;
}) {
  return (
    <GlassCard className="p-6 hover:border-violet-400/40 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-white/60">
            {title}
          </div>
          <div className="mt-2 text-xl md:text-2xl font-black">{value}</div>
          <div className="mt-2 text-sm text-white/60 leading-relaxed">{hint}</div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-300 shrink-0">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </GlassCard>
  );
}

function Countdown({ minutes = 15 }: { minutes?: number }) {
  const [end] = useState(() => Date.now() + minutes * 60 * 1000);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const left = Math.max(0, end - now);
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-black/40 border border-white/10 px-4 py-2 text-xs md:text-sm font-black uppercase tracking-widest">
      <Clock className="h-4 w-4 text-orange-300" />
      Oferta expira em {formatTime(left)}
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 md:pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-violet-600/25 via-[#0a0a0a] to-[#0a0a0a]" />
      <div className="absolute -top-36 left-1/2 -translate-x-1/2 h-[680px] w-[680px] rounded-full bg-fuchsia-600/15 blur-[140px]" />

      <div className="container mx-auto px-4 relative z-10 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs md:text-sm font-black uppercase tracking-widest border border-white/10 mb-7">
                <Sparkles className="h-4 w-4 text-violet-300" />
                High-end custom build
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95] uppercase">
                Monte um{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300">
                  PC Gamer
                </span>
                <br />
                de alto nível
              </h1>
              <p className="mt-6 text-lg md:text-2xl text-white/70 max-w-xl leading-relaxed">
                Estética premium com RGB e vidro temperado, airflow otimizado e desempenho para 1440p/4K. Montagem
                profissional, benchmark e entrega segura.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row gap-4">
                <Link
                  href="#checkout"
                  onClick={() => pushEvent("pcgamer3d_cta_primary_click", { location: "hero" })}
                  className="bg-white text-black px-8 py-4 rounded-full font-black text-lg md:text-xl transition-all shadow-xl hover:scale-105 inline-flex items-center justify-center gap-3"
                >
                  Montar meu Setup
                  <ChevronRight className="h-6 w-6" />
                </Link>
                <Link
                  href={WHATSAPP_LINK}
                  target="_blank"
                  onClick={() => pushEvent("pcgamer3d_whatsapp_click", { location: "hero" })}
                  className="bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-4 rounded-full font-black text-lg md:text-xl transition-all hover:scale-105 inline-flex items-center justify-center gap-3"
                >
                  <MessageCircle className="h-6 w-6" />
                  WhatsApp
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                {[
                  { icon: ShieldCheck, text: "Garantia 12 meses" },
                  { icon: BarChart3, text: "Benchmark + testes" },
                  { icon: BadgeCheck, text: "Montagem profissional" },
                  { icon: Lock, text: "Entrega segura" },
                ].map((x) => (
                  <div
                    key={x.text}
                    className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-xs md:text-sm font-black uppercase tracking-widest text-white/80"
                  >
                    <x.icon className="h-4 w-4 text-violet-300" />
                    {x.text}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <Reveal delay={0.12}>
              <GlassCard className="p-3 md:p-4">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-black/50 border border-white/10">
                  <iframe
                    title="PC Gamer 3D"
                    src={`https://sketchfab.com/models/${MODEL_ID}/embed?ui_theme=dark&autostart=0&camera=0&dnt=1`}
                    className="absolute inset-0 h-full w-full"
                    allow="autoplay; fullscreen; xr-spatial-tracking"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                <div className="px-2 md:px-3 pt-4 pb-2 flex items-center justify-between gap-4">
                  <div className="text-sm text-white/60">
                    Visualize o setup em 3D e peça a configuração ideal.
                  </div>
                  <Link
                    href={WHATSAPP_LINK}
                    target="_blank"
                    onClick={() => pushEvent("pcgamer3d_whatsapp_click", { location: "viewer" })}
                    className="inline-flex items-center gap-2 text-white font-black text-sm md:text-base border-b-2 border-violet-400/70 pb-1 hover:text-violet-300 transition-colors"
                  >
                    Orçar agora <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </GlassCard>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Specs() {
  return (
    <section className="py-20 border-t border-white/5" id="specs">
      <div className="container mx-auto px-4">
        <Reveal>
          <div className="max-w-4xl mx-auto text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-black uppercase">Especificações high-end</h2>
            <p className="text-white/60 mt-4 text-lg md:text-xl">
              Componentes premium com foco em estabilidade, temperatura e performance real.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Reveal>
            <SpecCard
              title="Processador (CPU)"
              value="Ryzen 7/9 ou Intel i7/i9"
              hint="Alto FPS e multitarefa para streaming e criação."
              icon={Cpu}
            />
          </Reveal>
          <Reveal delay={0.05}>
            <SpecCard
              title="Placa de vídeo (GPU 3 fans)"
              value="RTX high-end"
              hint="Ray tracing, DLSS e 1440p/4K com folga."
              icon={CircuitBoard}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <SpecCard
              title="Memória RAM (RGB)"
              value="32GB DDR5 RGB"
              hint="Baixa latência e estabilidade para jogos pesados."
              icon={MemoryStick}
            />
          </Reveal>
          <Reveal>
            <SpecCard
              title="Armazenamento"
              value="NVMe Gen4/Gen5"
              hint="Loadings rápidos e responsividade do sistema."
              icon={HardDrive}
            />
          </Reveal>
          <Reveal delay={0.05}>
            <SpecCard
              title="Refrigeração"
              value="Water Cooler 360mm"
              hint="Temperatura controlada e visual premium."
              icon={Fan}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <SpecCard
              title="Gabinete"
              value="Vidro temperado + RGB"
              hint="Acabamento de vitrine e airflow otimizado."
              icon={Zap}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <section className="py-20 border-t border-white/5" id="galeria">
      <div className="container mx-auto px-4">
        <Reveal>
          <div className="max-w-4xl mx-auto text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-black uppercase">Galeria</h2>
            <p className="text-white/60 mt-4 text-lg md:text-xl">
              Detalhes internos, iluminação e acabamento premium.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {GALLERY.map((img, idx) => (
            <Reveal key={img.src} delay={idx * 0.03}>
              <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Checkout() {
  const price = 12999;
  const [payment, setPayment] = useState<"pix" | "card">("pix");

  const displayed = useMemo(() => {
    const pixPrice = Math.round(price * 0.9);
    if (payment === "pix") return { label: "PIX com 10% off", value: pixPrice };
    return { label: "Cartão em 12x", value: price };
  }, [payment, price]);

  const installment = useMemo(() => {
    const v = payment === "card" ? price / 12 : Math.round(price * 0.9);
    return v;
  }, [payment, price]);

  function formatBRL(v: number) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  return (
    <section className="py-20 border-t border-white/5" id="checkout">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start max-w-6xl mx-auto">
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="text-3xl md:text-5xl font-black uppercase">Oferta e pagamento</h2>
              <p className="text-white/60 mt-4 text-lg md:text-xl leading-relaxed">
                Escolha a forma de pagamento e receba uma proposta com configuração ideal para seu objetivo.
              </p>

              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Montagem profissional + cable management",
                  "Teste de benchmark e estabilidade",
                  "Garantia de 12 meses",
                  "Entrega segura e bem embalada",
                ].map((b) => (
                  <div
                    key={b}
                    className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 flex items-start gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                    <div className="font-bold text-white/80">{b}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={0.08}>
              <GlassCard className="p-7 md:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-white/60">
                      High-end custom build
                    </div>
                    <div className="mt-2 text-2xl md:text-3xl font-black">
                      {formatBRL(displayed.value)}
                    </div>
                    <div className="mt-2 text-sm text-white/60">
                      {payment === "card" ? `12x de ${formatBRL(installment)}` : displayed.label}
                    </div>
                  </div>
                  <Countdown minutes={15} />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPayment("pix")}
                    className={`rounded-2xl px-4 py-3 font-black uppercase tracking-widest text-sm border transition-colors ${
                      payment === "pix"
                        ? "bg-violet-500/20 border-violet-400/40 text-white"
                        : "bg-black/30 border-white/10 text-white/70 hover:text-white"
                    }`}
                  >
                    PIX
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayment("card")}
                    className={`rounded-2xl px-4 py-3 font-black uppercase tracking-widest text-sm border transition-colors ${
                      payment === "card"
                        ? "bg-violet-500/20 border-violet-400/40 text-white"
                        : "bg-black/30 border-white/10 text-white/70 hover:text-white"
                    }`}
                  >
                    Cartão
                  </button>
                </div>

                <div className="mt-6 text-white/60 text-sm leading-relaxed">
                  Valores de referência. A proposta final depende da configuração (CPU/GPU, armazenamento, gabinete e RGB).
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <Link
                    href={WHATSAPP_LINK}
                    target="_blank"
                    onClick={() => pushEvent("pcgamer3d_whatsapp_click", { location: "checkout" })}
                    className="inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-4 rounded-full font-black text-lg transition-colors"
                  >
                    <MessageCircle className="h-6 w-6" />
                    Montar meu Setup
                  </Link>
                  <Link
                    href="/montagempc"
                    onClick={() => pushEvent("pcgamer3d_secondary_click", { location: "checkout" })}
                    className="inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full font-black text-lg hover:bg-zinc-200 transition-colors"
                  >
                    <CreditCard className="h-6 w-6" />
                    Ver montagem premium
                  </Link>
                </div>
              </GlassCard>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <section className="py-16 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="text-2xl font-black uppercase tracking-tight">
              Balão da Informática
            </div>
            <div className="mt-3 text-white/60 leading-relaxed">
              PC Gamer premium com montagem profissional, testes e acabamento de vitrine.
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                { icon: ShieldCheck, text: "Ambiente seguro" },
                { icon: BadgeCheck, text: "Garantia 12 meses" },
                { icon: BarChart3, text: "Benchmark" },
              ].map((x) => (
                <div
                  key={x.text}
                  className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/80"
                >
                  <x.icon className="h-4 w-4 text-violet-300" />
                  {x.text}
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="text-sm font-black uppercase tracking-widest text-white/70">
              Institucional
            </div>
            <div className="mt-4 space-y-2">
              {[
                { href: "/sobre-nos", label: "Sobre nós" },
                { href: "/envio-e-entrega", label: "Envio e entrega" },
                { href: "/trocas-e-devolucoes", label: "Trocas e devoluções" },
                { href: "/seguranca-e-privacidade", label: "Segurança e privacidade" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block text-white/70 hover:text-white font-bold"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="md:col-span-4">
            <div className="text-sm font-black uppercase tracking-widest text-white/70">
              Contato
            </div>
            <div className="mt-4 space-y-2 text-white/70 font-bold">
              <div>Av. Anchieta, 789 - Cambuí, Campinas/SP</div>
              <div>(19) 98751-0267</div>
              <div>Balaocastelo@balaodainformatica.com.br</div>
            </div>
            <div className="mt-6">
              <Link
                href={WHATSAPP_LINK}
                target="_blank"
                onClick={() => pushEvent("pcgamer3d_whatsapp_click", { location: "footer" })}
                className="inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full font-black text-lg hover:bg-zinc-200 transition-colors w-full"
              >
                <MessageCircle className="h-6 w-6" />
                Falar com especialista
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-12 text-center text-white/40 text-sm font-bold">
          © {new Date().getFullYear()} Balão da Informática. Todos os direitos reservados.
        </div>
      </div>
    </section>
  );
}

export default function Pcgamer3dLanding() {
  useEffect(() => {
    pushEvent("pcgamer3d_view", { page: "/pcgamer3d" });
  }, []);

  return (
    <>
      <Hero />
      <Specs />
      <Gallery />
      <Checkout />
      <Footer />
    </>
  );
}

