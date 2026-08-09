import React from "react";
import {
  Lightbulb,
  ShieldCheck,
  TrendingUp,
  Scale,
  Sparkles,
} from "lucide-react";
import { ResultadoVenda } from "../types";

interface InsightsProps {
  resultadoVenda: ResultadoVenda;
  valorCompraOriginal: number;
  custoAquisicaoExtra: number;
  saldoDevedorAtual: number;
}

export const InsightsInteligentes: React.FC<InsightsProps> = ({
  resultadoVenda,
  valorCompraOriginal,
  custoAquisicaoExtra,
  saldoDevedorAtual,
}) => {
  const {
    valorVenda,
    impostoRendaCalculado,
    isentoIR,
    motivoIsencao,
    totalTaxasExtras = 0,
  } = resultadoVenda;

  const custoTotalAquisicao = valorCompraOriginal + custoAquisicaoExtra;
  const lucroBruto = valorVenda - custoTotalAquisicao;
  const percentualLucroBruto =
    custoTotalAquisicao > 0 ? (lucroBruto / custoTotalAquisicao) * 100 : 0;

  // Ponto de equilíbrio (Break-even): valor de venda mínimo para quitar dívida + corretagem + taxas e não ter prejuízo no bolso
  const valorVendaMinimoBreakEven =
    (saldoDevedorAtual + totalTaxasExtras) / (1 - 0.06);

  const margemSegurancaBreakeven =
    valorVenda > 0 ? ((valorVenda - valorVendaMinimoBreakEven) / valorVenda) * 100 : 0;

  return (
    <div id="relatorio" className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Análise Estratégica Automática
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 mt-0.5">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Insights Inteligentes da Venda
          </h3>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
          Relatório Financeiro
        </span>
      </div>

      {/* Grid de 3 Cards de Insights (Column UI Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* INSIGHT 1: Status Fiscal de IRPF */}
        <div className="bg-slate-50/70 p-5 rounded-xl border border-slate-200/80 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Eficiência Fiscal (IRPF)
            </span>
            <ShieldCheck
              className={`w-5 h-5 ${isentoIR ? "text-emerald-600" : "text-amber-500"}`}
            />
          </div>

          <div>
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              {isentoIR ? (
                <span className="text-emerald-700">100% ISENTO</span>
              ) : (
                <span className="text-slate-800">
                  R$ {impostoRendaCalculado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {isentoIR
                ? motivoIsencao || "A venda enquadra-se nas regras legais de isenção de imposto de renda sobre ganho de capital."
                : `Será retido R$ ${impostoRendaCalculado.toLocaleString("pt-BR")} de IRPF sobre o ganho de capital tributável.`}
            </p>
          </div>
        </div>

        {/* INSIGHT 2: Valorização & Margem Bruta */}
        <div className="bg-slate-50/70 p-5 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Valorização do Imóvel
            </span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>

          <div>
            <div className="text-lg sm:text-xl font-extrabold text-blue-900 flex items-center gap-1.5">
              {percentualLucroBruto >= 0 ? "+" : ""}
              {percentualLucroBruto.toFixed(1)}%
              <span className="text-xs font-normal text-slate-500">sobre compra</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {lucroBruto >= 0
                ? `O imóvel valorizou R$ ${lucroBruto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} em relação ao custo de aquisição (R$ ${custoTotalAquisicao.toLocaleString("pt-BR")}).`
                : `O valor simulado está R$ ${Math.abs(lucroBruto).toLocaleString("pt-BR")} abaixo do valor pago na compra.`}
            </p>
          </div>
        </div>

        {/* INSIGHT 3: Ponto de Equilíbrio (Break-Even) */}
        <div className="bg-slate-50/70 p-5 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Ponto de Equilíbrio Mínimo
            </span>
            <Scale className="w-5 h-5 text-indigo-600" />
          </div>

          <div>
            <div className="text-lg sm:text-xl font-extrabold text-slate-900">
              R$ {valorVendaMinimoBreakEven.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Valor mínimo de venda necessário para quitar o saldo devedor (R$ {saldoDevedorAtual.toLocaleString("pt-BR")}) e as taxas sem prejuízo. Margem atual:{" "}
              <strong className="text-indigo-700">{margemSegurancaBreakeven.toFixed(1)}%</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
