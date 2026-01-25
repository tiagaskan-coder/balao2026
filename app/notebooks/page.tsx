import React from "react";
import LandingPage from "@/components/LandingPage";
import { Laptop } from "lucide-react";

export default function NotebooksPage() {
  return (
    <LandingPage
      title="Notebooks para Trabalho e Estudo"
      subtitle="Portabilidade e desempenho onde você estiver"
      description="Encontre o notebook ideal para suas necessidades. Trabalhamos com as melhores marcas (Dell, Lenovo, Asus, Acer, Apple) e modelos. Notebooks para escritório, design, engenharia e uso doméstico com preços imperdíveis."
      benefits={[
        "Variedade de marcas e modelos à pronta entrega",
        "Opções com SSD e upgrade de memória RAM",
        "Notebooks novos e seminovos com garantia",
        "Parcelamento facilitado no cartão",
        "Atendimento personalizado para indicar o melhor modelo"
      ]}
      ctaText="Ver Ofertas de Notebooks"
      icon={<Laptop size={48} />}
    />
  );
}
