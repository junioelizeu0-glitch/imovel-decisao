import React from "react";
import { Home, DollarSign, PlusCircle } from "lucide-react";

interface HeaderProps {
  onNovaAnalise?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNovaAnalise }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 card-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo estilo LIFEwise */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onNovaAnalise}>
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

        {/* Botão de Ação: Limpar e Nova Análise */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onNovaAnalise}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Nova Análise (Limpar Campos)
          </button>
        </div>
      </div>
    </header>
  );
};
