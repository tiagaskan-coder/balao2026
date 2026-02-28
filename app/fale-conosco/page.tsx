import { Metadata } from "next";
import ContactContent from "./ContactContent";
import JsonLd, { generateOrganizationSchema, generateBreadcrumbSchema } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Fale Conosco | Balão da Informática",
  description:
    "Entre em contato com o Balão da Informática por telefone, e-mail ou formulário. Atendimento para Campinas, região metropolitana e clientes de todo o Brasil.",
  keywords: [
    "contato balão da informática",
    "telefone loja de informática campinas",
    "suporte balão da informática",
    "atendimento campinas",
  ],
};

export default function FaleConoscoPage() {
  const breadcrumbItems = [
    { name: 'Home', item: 'https://www.balao.info' },
    { name: 'Fale Conosco', item: 'https://www.balao.info/fale-conosco' }
  ];

  return (
    <>
      <JsonLd data={[
        generateOrganizationSchema(),
        generateBreadcrumbSchema(breadcrumbItems)
      ]} />
      <ContactContent />
    </>
  );
}
