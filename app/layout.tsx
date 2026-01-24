import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { SidebarProvider } from "@/context/SidebarContext";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Balão da Informática | Hardware, PCs Gamer e Mais",
  description: "Sua loja de confiança para hardware, PCs gamer, notebooks e periféricos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`antialiased flex flex-col min-h-screen`}
      >
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <Suspense fallback={null}>
                <SidebarProvider>
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
