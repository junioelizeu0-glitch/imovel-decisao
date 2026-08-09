import React from "react";
import { Plus, Building2 } from "lucide-react";

interface HeaderProps {
  onNovaAnalise: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNovaAnalise }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-sm">
          <Building2 className="w-5 h-5 text-teal-400" />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            Análise de Venda de Imóvel Financiado
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            Cálculo automatizado de quitação, corretagem, IRPF e resultado líquido no bolso.
          </p>
        </div>
      </div>

      <button
        onClick={onNovaAnalise}
        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
      >
        <Plus className="w-4 h-4 text-teal-400" />
        <span className="hidden sm:inline">Nova Análise</span>
      </button>
    </header>
  );
};
