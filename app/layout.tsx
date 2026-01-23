import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Balão da Informática | Hardware, PCs Gamer e Mais",
  description: "Sua loja de confiança para hardware, PCs gamer, notebooks e periféricos.",
};

import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <ToastProvider>
          <CartProvider>
              {children}
              <Footer />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
