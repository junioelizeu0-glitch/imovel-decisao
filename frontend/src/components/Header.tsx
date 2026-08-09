import React from "react";
import { Home, DollarSign, Calculator, TrendingUp, HelpCircle } from "lucide-react";

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 card-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo estilo LIFEwise da imagem de inspiração */}
        <div className="flex items-center space-x-3 cursor-pointer">
          <div className="relative w-11 h-11 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-teal-600/20">
            <Home className="w-6 h-6 stroke-[2.2]" />
            <span className="absolute -bottom-1 -right-1 bg-amber-400 rounded-full p-0.5 text-slate-900 border-2 border-white">
              <DollarSign className="w-3.5 h-3.5 stroke-[3]" />
            </span>
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              Imóvel<span className="text-teal-600">Wise</span>
            </span>
            <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase -mt-1">
              Análise Venda vs. Aluguel
            </p>
          </div>
        </div>

        {/* Navegação da inspiração */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
          <a href="#simulador" className="text-teal-600 font-semibold flex items-center gap-1.5 transition-colors">
            <Calculator className="w-4 h-4" /> Simulação Lado a Lado
          </a>
          <a href="#financiamento" className="hover:text-teal-600 transition-colors">
            Financiamento
          </a>
          <a href="#regras-ir" className="hover:text-teal-600 transition-colors">
            Imposto de Renda
          </a>
          <a href="#investimentos" className="hover:text-teal-600 transition-colors">
            Rendimento CDI
          </a>
        </nav>

        {/* Status / Ação rápida */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" /> Nova Análise
          </button>
        </div>
      </div>
    </header>
  );
};
