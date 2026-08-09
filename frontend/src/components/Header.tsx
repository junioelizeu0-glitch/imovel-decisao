import React from "react";
import { PlusCircle } from "lucide-react";

interface HeaderProps {
  onNovaAnalise?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNovaAnalise }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 card-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Título simples sem logo */}
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">
          Análise de Venda vs. Aluguel de Imóvel Financiado
        </h1>

        {/* Botão de Ação: Nova Análise */}
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
