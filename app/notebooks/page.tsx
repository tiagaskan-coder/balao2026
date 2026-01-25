"use client";

import React from "react";
import Link from "next/link";

export default function NotebooksPage() {
  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#333] font-sans leading-relaxed">
      <header className="bg-gradient-to-br from-[#ff4d00] to-[#ff9900] text-white py-20 px-5 text-center">
        <h1 className="text-5xl font-bold mb-3">Balão da Informática</h1>
        <p className="text-xl max-w-3xl mx-auto mb-8">
          Notebooks de alta conversão para trabalho, estudos e performance máxima. Tecnologia que impulsiona resultados.
        </p>
        <Link 
          href="#contato" 
          className="inline-block bg-black text-white py-4 px-9 rounded-full text-lg no-underline transition-transform duration-300 hover:bg-gray-900 hover:scale-105"
        >
          Quero meu notebook agora
        </Link>
      </header>

      <section className="py-20 px-5 max-w-6xl mx-auto">
        <h2 className="text-center text-4xl font-bold mb-5">🔥 Notebooks que Vendem, Performam e Impressionam</h2>
        <p className="text-center max-w-3xl mx-auto mb-10">
          Trabalhamos com equipamentos selecionados para <strong>alta durabilidade, velocidade e custo-benefício</strong>, ideais para quem quer produtividade sem dor de cabeça.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
            <svg width="100%" height="120" viewBox="0 0 300 120" className="mx-auto">
              <rect x="20" y="30" width="260" height="60" rx="10" fill="#ff9900"/>
              <rect x="40" y="40" width="220" height="40" rx="6" fill="#fff"/>
            </svg>
            <h3 className="mt-5 text-2xl font-bold">Alta Performance</h3>
            <p className="mt-2">Processadores rápidos, SSDs modernos e desempenho fluido para qualquer tarefa.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
            <svg width="100%" height="120" viewBox="0 0 300 120" className="mx-auto">
              <circle cx="150" cy="60" r="40" fill="#ff4d00"/>
              <text x="150" y="70" fontSize="28" textAnchor="middle" fill="#fff">R$</text>
            </svg>
            <h3 className="mt-5 text-2xl font-bold">Preço Justo</h3>
            <p className="mt-2">Equipamentos com excelente custo-benefício e condições especiais.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
            <svg width="100%" height="120" viewBox="0 0 300 120" className="mx-auto">
              <path d="M40 80 L150 30 L260 80" stroke="#ff9900" strokeWidth="8" fill="none"/>
              <circle cx="150" cy="30" r="10" fill="#ff9900"/>
            </svg>
            <h3 className="mt-5 text-2xl font-bold">Garantia & Suporte</h3>
            <p className="mt-2">Assistência especializada para você comprar com total segurança.</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-5 max-w-6xl mx-auto bg-[#fff0e6] rounded-3xl">
        <h2 className="text-center text-4xl font-bold mb-5">🚀 Para Quem é a Balão da Informática?</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
            <h3 className="text-2xl font-bold mb-2">Estudantes</h3>
            <p>Leves, rápidos e ideais para aulas, pesquisas e trabalhos.</p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
            <h3 className="text-2xl font-bold mb-2">Empresas</h3>
            <p>Padronização, confiabilidade e produtividade para equipes.</p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
            <h3 className="text-2xl font-bold mb-2">Profissionais</h3>
            <p>Design, programação, escritório e uso intenso sem travamentos.</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-5 max-w-6xl mx-auto">
        <h2 className="text-center text-4xl font-bold mb-5">📍 Onde Estamos</h2>
        <p className="text-center mb-10">Atendemos presencialmente e online com envio rápido.</p>

        <div className="bg-white rounded-3xl p-8 shadow-xl mt-10">
          <svg width="100%" height="300" viewBox="0 0 600 300" className="mx-auto w-full h-auto">
            <rect width="600" height="300" fill="#e6f2ff"/>
            <path d="M100 200 L200 150 L300 180 L400 120 L500 160" stroke="#ff4d00" strokeWidth="6" fill="none"/>
            <circle cx="300" cy="180" r="10" fill="#ff4d00"/>
            <text x="310" y="175" fontSize="16" fill="#333">Balão da Informática</text>
          </svg>
          <p className="text-center mt-5">
            Atendimento humanizado e especializado para você escolher o notebook ideal.
          </p>
        </div>
      </section>

      <section id="contato" className="py-20 px-5 max-w-6xl mx-auto bg-[#fff0e6] rounded-3xl mb-10">
        <h2 className="text-center text-4xl font-bold mb-5">🎯 Pronto para Comprar?</h2>
        <p className="text-center max-w-2xl mx-auto mb-10">
          Fale agora com nossa equipe e encontre o notebook perfeito para suas necessidades.
        </p>

        <div className="text-center">
          <Link 
            href="#" 
            className="inline-block bg-black text-white py-4 px-9 rounded-full text-lg no-underline transition-transform duration-300 hover:bg-gray-900 hover:scale-105"
          >
            Falar com um especialista
          </Link>
        </div>
      </section>

      <footer className="bg-[#111] text-[#ccc] text-center py-12 px-5">
        <p><strong className="text-white">Balão da Informática</strong></p>
      </footer>
    </div>
  );
}
