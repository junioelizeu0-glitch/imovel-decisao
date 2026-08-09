import React from "react";
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Award,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Percent,
  ChevronRight,
  PieChart as PieIcon,
} from "lucide-react";
import { ResultadoAluguel } from "../types";
import { DonutChartCard } from "./DonutChartCard";

interface DashboardProps {
  resultado: ResultadoAluguel;
  valorAluguelMensal: number;
  setValorAluguelMensal: (val: number) => void;
  custosMensaisExtras: number;
  setCustosMensaisExtras: (val: number) => void;
  taxaValorizacaoAnual: number;
  setTaxaValorizacaoAnual: (val: number) => void;
  taxaCDIAnual: number;
  setTaxaCDIAnual: (val: number) => void;
}

export const DashboardComparativo: React.FC<DashboardProps> = ({
  resultado,
  valorAluguelMensal,
  setValorAluguelMensal,
  custosMensaisExtras,
  setCustosMensaisExtras,
  taxaValorizacaoAnual,
  setTaxaValorizacaoAnual,
  taxaCDIAnual,
  setTaxaCDIAnual,
}) => {
  const {
    opcaoRecomendada,
    resumoComparativo,
    diferencaPatrimonial,
    patrimonioFinalAlugando,
    patrimonioFinalVendaInvestido,
    resultadoVendaAgora,
    mesesAteQuitar,
    anosAteQuitar,
    valorImovelProjetado,
    fluxoCaixaMensalLiquido,
    fluxoNegativo,
    alertaRisco,
    irAluguelMensal,
  } = resultado;

  return (
    <div className="space-y-8" id="simulador">
      {/* 1. Painel de Parâmetros de Simulação Rápida */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-teal-600" />
            Ajustes Finos do Cenário de Aluguel & Rendimento
          </h3>
          <span className="text-xs text-slate-400">Atualização em Tempo Real</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Aluguel Mensal Estimado
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">R$</span>
              <input
                type="number"
                value={valorAluguelMensal}
                onChange={(e) => setValorAluguelMensal(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Custos Mensais Extras (Cond./IPTU)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">R$</span>
              <input
                type="number"
                value={custosMensaisExtras}
                onChange={(e) => setCustosMensaisExtras(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Valorização Anual do Imóvel
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={taxaValorizacaoAnual}
                onChange={(e) => setTaxaValorizacaoAnual(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-sm font-bold text-teal-700"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">% a.a.</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Rentabilidade de Ref. (CDI/Selic)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={taxaCDIAnual}
                onChange={(e) => setTaxaCDIAnual(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-sm font-bold text-slate-800"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">% a.a.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Banner de Resultado Principal / Vencedor */}
      <div
        className={`rounded-2xl p-6 sm:p-8 card-shadow border-2 transition-all ${
          opcaoRecomendada === "ALUGAR"
            ? "bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 border-teal-500 text-white"
            : "bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border-amber-400 text-white"
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  opcaoRecomendada === "ALUGAR"
                    ? "bg-teal-400/20 text-teal-300 border border-teal-400/30"
                    : "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                }`}
              >
                <Award className="w-4 h-4" />
                Vencedor Financeiro: {opcaoRecomendada === "ALUGAR" ? "ALUGAR E AMORTIZAR" : "VENDER AGORA E INVESTIR"}
              </span>
              <span className="text-xs text-slate-300 font-medium">Horizonte: {mesesAteQuitar} meses ({anosAteQuitar} anos)</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {opcaoRecomendada === "ALUGAR"
                ? `Alugar gera +R$ ${Math.abs(diferencaPatrimonial).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} de patrimônio`
                : `Vender gera +R$ ${Math.abs(diferencaPatrimonial).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} de patrimônio`}
            </h2>

            <p className="text-sm text-slate-200 leading-relaxed font-normal">
              {resumoComparativo}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center min-w-[220px] self-stretch md:self-auto flex flex-col justify-center">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-300">
              Vantagem Patrimonial
            </span>
            <span className="text-2xl font-black text-amber-300 mt-1">
              +R$ {Math.abs(diferencaPatrimonial).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-slate-300 mt-1">em {anosAteQuitar} anos</span>
          </div>
        </div>
      </div>

      {/* Alerta de Risco para Fluxo Negativo */}
      {alertaRisco && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 text-amber-900 flex items-start gap-4 card-shadow">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold">Alerta de Risco Financeiro</h4>
            <p className="text-xs text-amber-800 leading-relaxed">{alertaRisco}</p>
          </div>
        </div>
      )}

      {/* 3. Gráfico Donut da Composição do Aluguel */}
      <DonutChartCard
        valorAluguel={valorAluguelMensal}
        valorParcela={resultadoVendaAgora.saldoDevedorAbatido > 0 ? resultado.valorAluguelMensal - fluxoCaixaMensalLiquido - custosMensaisExtras - irAluguelMensal : 0}
        custosExtras={custosMensaisExtras}
        irAluguel={irAluguelMensal}
        fluxoLiquido={fluxoCaixaMensalLiquido}
      />

      {/* 4. Quadro Comparativo Lado a Lado (2 Colunas Estilo Inspiração) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUNA 1: VENDER AGORA */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 card-shadow card-shadow-hover space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Opção A
                </span>
                <h3 className="text-lg font-bold text-slate-900">Vender Agora</h3>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                Liquidez Implacável
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-600">Valor de Venda Estimado</span>
                <span className="font-bold text-slate-900">
                  R$ {resultadoVendaAgora.valorVenda.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-50 text-rose-600">
                <span>(-) Quitação do Saldo Devedor</span>
                <span className="font-semibold">
                  -R$ {resultadoVendaAgora.saldoDevedorAbatido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-50 text-rose-600">
                <span>(-) Corretagem Imobiliária (6%)</span>
                <span className="font-semibold">
                  -R$ {resultadoVendaAgora.valorCorretagem.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-50 text-rose-600">
                <span className="flex items-center gap-1">
                  (-) Imposto de Renda (Ganho de Capital)
                  {resultadoVendaAgora.isentoIR && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      ISENTO
                    </span>
                  )}
                </span>
                <span className="font-semibold">
                  -R$ {resultadoVendaAgora.impostoRendaCalculado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {resultadoVendaAgora.isentoIR && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 text-[11px] rounded-xl border border-emerald-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{resultadoVendaAgora.motivoIsencao}</span>
                </div>
              )}

              <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between mt-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-semibold">
                    Valor Líquido no Bolso Agora
                  </span>
                  <span className="text-xl font-extrabold text-teal-400">
                    R$ {resultadoVendaAgora.resultadoLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <DollarSign className="w-8 h-8 text-teal-400/40" />
              </div>
            </div>
          </div>

          {/* Projeção de Investimento no CDI */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              Patrimônio Investido a {taxaCDIAnual}% a.a. em {anosAteQuitar} anos
            </span>
            <div className="text-2xl font-black text-slate-900">
              R$ {patrimonioFinalVendaInvestido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500">
              Caso você venda o imóvel hoje e aplique o saldo líquido a 100% do CDI no mesmo horizonte de tempo.
            </p>
          </div>
        </div>

        {/* COLUNA 2: ALUGAR E AMORTIZAR */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 card-shadow card-shadow-hover space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-teal-600 uppercase tracking-widest">
                  Opção B
                </span>
                <h3 className="text-lg font-bold text-slate-900">Alugar e Amortizar</h3>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-100 text-teal-800">
                Acumulação de Patrimônio
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-600">Aluguel Mensal Bruto</span>
                <span className="font-bold text-slate-900">
                  R$ {valorAluguelMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-50 text-rose-600">
                <span>(-) Imposto de Renda Mensal (IRPF)</span>
                <span className="font-semibold">
                  -R$ {irAluguelMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-50 text-rose-600">
                <span>(-) Custos Mensais Extras</span>
                <span className="font-semibold">
                  -R$ {custosMensaisExtras.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-50 text-teal-700">
                <span className="font-bold">(=) Fluxo de Caixa Mensal Líquido</span>
                <span className="font-black text-sm">
                  R$ {fluxoCaixaMensalLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-4 bg-teal-950 text-white rounded-xl flex items-center justify-between mt-2">
                <div>
                  <span className="text-[10px] text-teal-300 uppercase tracking-widest block font-semibold">
                    Prazo Estimado para Quitação Total
                  </span>
                  <span className="text-xl font-extrabold text-amber-400">
                    {mesesAteQuitar} parcelas ({anosAteQuitar} anos)
                  </span>
                </div>
                <Clock className="w-8 h-8 text-amber-400/40" />
              </div>
            </div>
          </div>

          {/* Valor Projetado e Patrimônio Final */}
          <div className="p-5 bg-teal-50/80 rounded-xl border border-teal-200 space-y-2">
            <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1">
              <Award className="w-4 h-4 text-teal-600" />
              Patrimônio Final em {anosAteQuitar} anos (Imóvel Quitado + Caixa)
            </span>
            <div className="text-2xl font-black text-teal-900">
              R$ {patrimonioFinalAlugando.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-teal-700">
              Valor estimado do imóvel projetado a {taxaValorizacaoAnual}% a.a. (R$ {valorImovelProjetado.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}) somado ao fluxo de caixa acumulado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
