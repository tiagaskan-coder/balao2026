import type { Metadata } from "next";
import Header from "@/components/Header";
import Pcgamer3dLanding from "./pcgamer3d-landing";

export const metadata: Metadata = {
  title: "PC Gamer High-End Custom Build | 3D + RGB + Vidro Temperado",
  description:
    "Monte um PC Gamer high-end sob medida com montagem profissional, garantia de 12 meses, testes de benchmark e entrega segura. Veja o setup em 3D e peça seu orçamento.",
  keywords: [
    "pc gamer high end",
    "pc gamer custom build",
    "montagem pc gamer profissional",
    "pc gamer rgb",
    "pc gamer vidro temperado",
    "pc gamer water cooler 360mm",
    "pc gamer rtx 3 fans",
    "pc gamer nvme gen4",
    "pc gamer nvme gen5",
    "pc gamer ddr5 rgb",
  ],
  alternates: {
    canonical: "https://www.balao.info/pcgamer3d",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/pcgamer3d",
    title: "PC Gamer High-End Custom Build | 3D + RGB",
    description:
      "Landing premium para montar seu setup: 3D, specs high-end, garantia de 12 meses e entrega segura.",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "PC Gamer High-End Custom Build | 3D + RGB",
    description: "Monte seu setup premium com garantia e benchmark.",
    images: ["/logo.png"],
  },
};

export default function PcGamer3DPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-violet-500 selection:text-white">
      <Header />
      <main>
        <Pcgamer3dLanding />
      </main>
    </div>
  );
}

