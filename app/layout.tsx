import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { AIContextProvider } from "@/context/AIContext"; // Nova Camada de Persistência
import Footer from "@/components/Footer";
import ProductPreview from "@/components/ProductPreview";
import AIOverlay from "@/components/AIOverlay"; // Nova Interface de Preview
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { getCategories } from "@/lib/db";
import Sidebar from "@/components/Sidebar";
import type { Category } from "@/lib/utils";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#E60012",
};

export const metadata: Metadata = {
  title: {
    template: "%s | Balão da Informática Campinas",
    default: "Balão da Informática | Loja de Informática em Campinas e Região",
  },
  description: "A melhor loja de informática em Campinas e região. Encontre PCs Gamer, Notebooks, Placas de Vídeo, Hardware e Periféricos com o melhor preço. Entregas em Sumaré, Hortolândia, Paulínia, Valinhos e Vinhedo.",
  keywords: ["informatica campinas", "loja de informatica campinas", "pc gamer campinas", "peças de pc campinas", "notebook campinas", "hardware campinas", "sumare", "hortolandia", "paulinia", "valinhos", "vinhedo"],
  authors: [{ name: "Balão da Informática" }],
  creator: "Balão da Informática",
  publisher: "Balão da Informática",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balaodainformatica.com.br",
    title: "Balão da Informática | Loja de Informática em Campinas e Região",
    description: "Hardware de alta performance, PCs Gamer e assistência técnica em Campinas. As melhores marcas e preços da RMC.",
    siteName: "Balão da Informática",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ComputerStore",
  "name": "Balão da Informática",
  "image": "https://www.balaodainformatica.com.br/logo.png",
  "description": "Loja de informática em Campinas especializada em hardware, PC Gamer e periféricos.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Av. Brasil, 1234",
    "addressLocality": "Campinas",
    "addressRegion": "SP",
    "postalCode": "13000-000",
    "addressCountry": "BR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -22.9099,
    "longitude": -47.0626
  },
  "url": "https://www.balaodainformatica.com.br",
  "telephone": "+551930000000",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "09:00",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "09:00",
      "closes": "13:00"
    }
  ],
  "priceRange": "$$"
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let categories: Category[] = [];
  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }

  return (
    <html lang="pt-BR">
      <body
        className={`antialiased flex flex-col min-h-screen overflow-x-hidden`}
      >
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <Suspense>
                <SidebarProvider>
                  <AIContextProvider>
                    <AIOverlay /> {/* Nova Interface de Preview */}
                    <Sidebar categories={categories} mobileOnly />
                    <div className="flex flex-col min-h-screen">
                      {/* Header será renderizado dentro das páginas ou layout específico se necessário, 
                          mas geralmente o Header é global. Se não houver Header aqui, 
                          ele deve estar sendo importado em outro lugar ou o layout espera que as páginas o tenham.
                          Vou assumir que o Header é parte do children ou layout padrão.
                          Mas para o FloatingWhatsApp, coloco no nível global. */}
                      <main className="flex-grow">
                        {children}
                      </main>
                      <Footer />
                      <FloatingWhatsApp />
                    </div>
                  </AIContextProvider>
                </SidebarProvider>
              </Suspense>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
