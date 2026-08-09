import React from "react";
import {
  LayoutDashboard,
  Building2,
  FileText,
  HelpCircle,
  TrendingUp,
  Settings,
  ChevronDown,
  Plus,
  ShieldCheck,
} from "lucide-react";

interface SidebarProps {
  onNovaAnalise: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNovaAnalise }) => {
  return (
    <aside className="w-64 bg-[#FAFBFD] border-r border-slate-200/80 flex flex-col justify-between hidden md:flex min-h-screen">
      <div className="p-5 space-y-6">
        {/* Logo da Plataforma */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-base shadow-sm">
            ID
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-sm tracking-tight block">
              Imóvel Decisão
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              Fintech Real Estate Analytics
            </span>
          </div>
        </div>

        {/* Workspace Selector (Inspirado em Andrew's Platform da Imagem 0.jpg) */}
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between shadow-xs cursor-pointer hover:border-slate-300 transition">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-xs font-bold text-slate-800 truncate">
              Simulação Principal
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        </div>

        {/* Menu de Navegação */}
        <nav className="space-y-1 text-xs font-medium text-slate-600">
          <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Plataforma
          </div>

          <a
            href="#simulacao"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-100 transition"
          >
            <LayoutDashboard className="w-4 h-4 text-blue-600" />
            Análise de Venda
          </a>

          <a
            href="#imovel"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100/80 text-slate-700 transition"
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            Dados do Imóvel
          </a>

          <a
            href="#financiamento"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100/80 text-slate-700 transition"
          >
            <TrendingUp className="w-4 h-4 text-slate-500" />
            Financiamento
          </a>

          <div className="px-2 pt-4 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Ferramentas Fiscais
          </div>

          <a
            href="#isencao"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100/80 text-slate-700 transition"
          >
            <ShieldCheck className="w-4 h-4 text-slate-500" />
            Regras de Isenção IR
          </a>

          <a
            href="#relatorio"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100/80 text-slate-700 transition"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            Relatórios e Graficos
          </a>
        </nav>
      </div>

      {/* Botão Nova Análise e Ajuda no Rodapé */}
      <div className="p-4 border-t border-slate-200/80 space-y-2">
        <button
          onClick={onNovaAnalise}
          className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4 text-blue-600" />
          Nova Análise
        </button>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 px-1">
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            Suporte Fiscal
          </span>
          <span className="font-mono text-[10px] text-slate-400">v2.4</span>
        </div>
      </div>
    </aside>
  );
};
