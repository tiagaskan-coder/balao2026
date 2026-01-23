import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* About Section */}
          <div>
            <div className="relative w-[160px] h-[50px] mb-6">
                <Image 
                    src="/logo.png" 
                    alt="Balão da Informática" 
                    fill
                    className="object-contain"
                />
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Sua loja de confiança para hardware, PCs gamer, notebooks e periféricos. 
              Qualidade, garantia e os melhores preços do mercado você encontra aqui.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-[#E60012] transition-colors"><Facebook size={20} /></a>
              <a href="#" className="hover:text-[#E60012] transition-colors"><Instagram size={20} /></a>
              <a href="#" className="hover:text-[#E60012] transition-colors"><Twitter size={20} /></a>
              <a href="#" className="hover:text-[#E60012] transition-colors"><Youtube size={20} /></a>
            </div>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Institucional</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-[#E60012] transition-colors">Sobre a Empresa</Link></li>
              <li><Link href="#" className="hover:text-[#E60012] transition-colors">Como Comprar</Link></li>
              <li><Link href="#" className="hover:text-[#E60012] transition-colors">Segurança e Privacidade</Link></li>
              <li><Link href="#" className="hover:text-[#E60012] transition-colors">Envio e Entrega</Link></li>
              <li><Link href="#" className="hover:text-[#E60012] transition-colors">Trocas e Devoluções</Link></li>
              <li><Link href="#" className="hover:text-[#E60012] transition-colors">Fale Conosco</Link></li>
            </ul>
          </div>

          {/* Categories Section */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Departamentos</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/?category=Hardware" className="hover:text-[#E60012] transition-colors">Hardware</Link></li>
              <li><Link href="/?category=PC Gamer" className="hover:text-[#E60012] transition-colors">Computadores Gamer</Link></li>
              <li><Link href="/?category=Notebooks" className="hover:text-[#E60012] transition-colors">Notebooks</Link></li>
              <li><Link href="/?category=Periféricos" className="hover:text-[#E60012] transition-colors">Periféricos</Link></li>
              <li><Link href="/?category=Monitores" className="hover:text-[#E60012] transition-colors">Monitores</Link></li>
              <li><Link href="/?category=Smartphones" className="hover:text-[#E60012] transition-colors">Smartphones</Link></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Atendimento</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-[#E60012] mt-0.5" />
                <div>
                    <span className="block font-bold text-white">(11) 4444-5555</span>
                    <span className="text-xs">Seg. a Sex. das 9h às 18h</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-[#E60012]" />
                <a href="mailto:sac@balaodainformatica.com.br" className="hover:text-white transition-colors">sac@balaodainformatica.com.br</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#E60012] mt-0.5" />
                <span>
                    Av. Paulista, 1000 - Bela Vista<br />
                    São Paulo - SP, 01310-100
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods Banner (Placeholder) */}
        <div className="border-t border-gray-800 pt-8 pb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm">Formas de Pagamento</div>
                <div className="flex gap-2 opacity-70">
                    <div className="w-10 h-6 bg-white rounded"></div>
                    <div className="w-10 h-6 bg-white rounded"></div>
                    <div className="w-10 h-6 bg-white rounded"></div>
                    <div className="w-10 h-6 bg-white rounded"></div>
                    <div className="w-10 h-6 bg-white rounded"></div>
                </div>
                <div className="text-sm flex items-center gap-2">
                    <span className="text-green-500">Site Seguro</span>
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
            </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          <p>&copy; 2026 Balão da Informática. Todos os direitos reservados. <a href="http://www.balao.info" target="_blank" className="hover:text-[#E60012]">www.balao.info</a></p>
        </div>
      </div>
    </footer>
  );
}
