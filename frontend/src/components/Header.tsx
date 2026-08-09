import React from "react";
import { Plus, RefreshCw, Shield, HelpCircle, User } from "lucide-react";

interface HeaderProps {
  onNovaAnalise: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNovaAnalise }) => {
  return (
    <header className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30">
      {/* Esquerda: Título da Página / Breadcrumb */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
          Análise de Venda de Imóvel Financiado
        </h1>
        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80">
          <Shield className="w-3 h-3 text-amber-600" />
          Simulação Ativa
        </span>
      </div>

      {/* Direita: Controles e Ações (Inspirado no topo da imagem 0.jpg) */}
      <div className="flex items-center gap-3">
        <a
          href="#ajuda"
          className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          Documentação Fiscal
        </a>

        {/* Badge Sandbox / Simulação */}
        <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          Modo Simulação
        </span>

        {/* Botão Nova Análise no Mobile */}
        <button
          onClick={onNovaAnalise}
          className="md:hidden bg-slate-900 text-white p-2 rounded-lg text-xs font-bold flex items-center gap-1"
          title="Nova Análise"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Avatar de Usuário (Estilo "AA" da Imagem 0.jpg) */}
        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
          ID
        </div>
      </div>
    </header>
  );
};
