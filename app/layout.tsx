import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { SidebarProvider } from "@/context/SidebarContext";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import { getCategories } from "@/lib/db";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#E60012",
};

export const metadata: Metadata = {
  title: "Balão da Informática | Hardware, PCs Gamer e Mais",
  description: "Sua loja de confiança para hardware, PCs gamer, notebooks e periféricos.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();

  return (
    <html lang="pt-BR">
      <body
        className={`antialiased flex flex-col min-h-screen overflow-x-hidden`}
      >
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <Suspense fallback={null}>
                <SidebarProvider>
                  <Sidebar categories={categories} mobileOnly />
                  {children}
                  <Footer />
                </SidebarProvider>
              </Suspense>
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
