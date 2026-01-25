import React from "react";
import LandingPage from "@/components/LandingPage";
import { Handshake } from "lucide-react";

export default function ConsignacaoPage() {
  return (
    <LandingPage
      title="Venda seu Usado em Consignação"
      subtitle="Transforme seu equipamento parado em dinheiro"
      description="Tem um PC ou notebook parado? Traga para a Balão da Informática! Avaliamos seu equipamento e o colocamos à venda em nossa loja. Você define o preço mínimo e nós cuidamos de todo o processo de venda, fotos, anúncios e atendimento."
      benefits={[
        "Avaliação justa do seu equipamento",
        "Exposição na loja física e online",
        "Segurança total na negociação",
        "Nós lidamos com os compradores para você",
        "Pagamento garantido após a venda"
      ]}
      ctaText="Avaliar meu Equipamento"
      icon={<Handshake size={48} />}
    />
  );
}
