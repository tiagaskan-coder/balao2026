import { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Fale Conosco | Balão da Informática",
  description: "Entre em contato conosco por telefone, e-mail ou formulário.",
};

export default function FaleConoscoPage() {
  return <ContactContent />;
}
