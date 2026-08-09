import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
  Cell,
  Legend,
} from "recharts";
import { ResultadoAluguel } from "../types";

interface GraficosProps {
  resultado: ResultadoAluguel;
  taxaCDIAnual: number;
}

export const GraficosComparativos: React.FC<GraficosProps> = ({ resultado, taxaCDIAnual }) => {
  const {
    resultadoVendaAgora,
    patrimonioFinalAlugando,
    patrimonioFinalVendaInvestido,
    evolucaoMensal = [],
    anosAteQuitar,
    mesesAteQuitar,
    fluxoCaixaMensalLiquido,
  } = resultado;

  // -------------------------------------------------------------
  // DADOS DO GRÁFICO 1: Cascata (Waterfall) da Venda
  // -------------------------------------------------------------
  const dadosWaterfall = [
    {
      nome: "Valor Venda",
      valor: resultadoVendaAgora.valorVenda,
      tipo: "positivo",
      cor: "#1F809B", // Teal
    },
    {
      nome: "(-) Saldo Devedor",
      valor: resultadoVendaAgora.saldoDevedorAbatido,
      tipo: "deducao",
      cor: "#EF4444", // Red
    },
    {
      nome: "(-) Imposto Renda",
      valor: resultadoVendaAgora.impostoRendaCalculado,
      tipo: "deducao",
      cor: "#F59E0B", // Amber
    },
    {
      nome: "(-) Corretagem (6%)",
      valor: resultadoVendaAgora.valorCorretagem,
      tipo: "deducao",
      cor: "#64748B", // Slate
    },
    {
      nome: "= Líquido Final",
      valor: resultadoVendaAgora.resultadoLiquido,
      tipo: "resultado",
      cor: "#10B981", // Emerald
    },
  ];

  // -------------------------------------------------------------
  // DADOS DO GRÁFICO 3: Barras Comparativas de Patrimônio Final
  // -------------------------------------------------------------
  const dadosPatrimonioComparativo = [
    {
      cenario: "Vender Agora & CDI",
      valor: Math.round(patrimonioFinalVendaInvestido),
      cor: "#475569",
    },
    {
      cenario: "Alugar & Amortizar",
      valor: Math.round(patrimonioFinalAlugando),
      cor: "#1F809B",
    },
  ];

  // -------------------------------------------------------------
  // DADOS DO GRÁFICO 4: Fluxo de Caixa Mensal do Aluguel
  // -------------------------------------------------------------
  const dadosFluxoCaixa = Array.from({ length: Math.min(24, mesesAteQuitar) }, (_, index) => ({
    mes: `Mês ${index + 1}`,
    fluxo: Math.round(fluxoCaixaMensalLiquido),
  }));

  const formatarMoedaResumida = (val: number) => {
    if (Math.abs(val) >= 1_000_000) {
      return `R$ ${(val / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(val) >= 1_000) {
      return `R$ ${(val / 1_000).toFixed(0)}k`;
    }
    return `R$ ${val}`;
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho da Seção de Gráficos */}
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-teal-600"></span>
          Gráficos Analíticos de Desempenho
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Visualizações estratégicas dos 4 aspectos financeiros fundamentais da simulação.
        </p>
      </div>

      {/* Grid de 4 Gráficos em Destaque (2x2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* -------------------------------------------------------------
            GRÁFICO 1: CASCATA (WATERFALL) DA VENDA
        ------------------------------------------------------------- */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 card-shadow space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600">
              Gráfico 1 • Decomposição Fiscal
            </span>
            <h4 className="text-base font-bold text-slate-900">
              Cascata (Waterfall) do Resultado da Venda
            </h4>
            <p className="text-xs text-slate-500">
              Do valor bruto da venda até o líquido efetivo no bolso após deduções e dívida.
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosWaterfall} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="nome" tick={{ fontSize: 11, fill: "#475569" }} interval={0} />
                <YAxis tickFormatter={formatarMoedaResumida} tick={{ fontSize: 11, fill: "#64748B" }} />
                <Tooltip
                  formatter={(val: number) => [
                    `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                    "Valor",
                  ]}
                />
                <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                  {dadosWaterfall.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* -------------------------------------------------------------
            GRÁFICO 2: LINHA TEMPORAL (EVOLUÇÃO MÊS A MÊS)
        ------------------------------------------------------------- */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 card-shadow space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600">
              Gráfico 2 • Curva Temporal ({mesesAteQuitar} Meses)
            </span>
            <h4 className="text-base font-bold text-slate-900">
              Saldo Devedor vs. Patrimônio Acumulado
            </h4>
            <p className="text-xs text-slate-500">
              Acompanhamento mês a mês da redução da dívida e crescimento patrimonial.
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolucaoMensal} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 11, fill: "#475569" }}
                  unit="m"
                />
                <YAxis tickFormatter={formatarMoedaResumida} tick={{ fontSize: 11, fill: "#64748B" }} />
                <Tooltip
                  formatter={(val: number, name: string) => [
                    `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                    name === "saldoDevedor" ? "Saldo Devedor" : "Patrimônio Acumulado",
                  ]}
                />
                <Legend formatter={(value) => (value === "saldoDevedor" ? "Saldo Devedor" : "Patrimônio Acumulado")} />
                <Line
                  type="monotone"
                  dataKey="saldoDevedor"
                  stroke="#EF4444"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="patrimonioAcumulado"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* -------------------------------------------------------------
            GRÁFICO 3: BARRAS COMPARATIVAS DE PATRIMÔNIO FINAL
        ------------------------------------------------------------- */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 card-shadow space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600">
              Gráfico 3 • Comparativo Final ({anosAteQuitar} Anos)
            </span>
            <h4 className="text-base font-bold text-slate-900">
              Patrimônio Projetado no Mesmo Prazo
            </h4>
            <p className="text-xs text-slate-500">
              Comparativo direto: Líquido investido a {taxaCDIAnual}% CDI vs. Imóvel quitado alugando.
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosPatrimonioComparativo} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="cenario" tick={{ fontSize: 11, fontStyle: "bold", fill: "#0F172A" }} />
                <YAxis tickFormatter={formatarMoedaResumida} tick={{ fontSize: 11, fill: "#64748B" }} />
                <Tooltip
                  formatter={(val: number) => [
                    `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                    "Patrimônio Final",
                  ]}
                />
                <Bar dataKey="valor" radius={[8, 8, 0, 0]} barSize={65}>
                  {dadosPatrimonioComparativo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* -------------------------------------------------------------
            GRÁFICO 4: FLUXO DE CAIXA MENSAL DO ALUGUEL
        ------------------------------------------------------------- */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 card-shadow space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600">
              Gráfico 4 • Fluxo de Caixa Mensal
            </span>
            <h4 className="text-base font-bold text-slate-900">
              Resultado Mensal Líquido (Aluguel − Custos)
            </h4>
            <p className="text-xs text-slate-500">
              Fluxo mensal livre (com linha de referência zero). Barras verdes indicam superávit.
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosFluxoCaixa} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "#64748B" }} />
                <YAxis tickFormatter={formatarMoedaResumida} tick={{ fontSize: 11, fill: "#64748B" }} />
                <Tooltip
                  formatter={(val: number) => [
                    `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                    "Fluxo Mensal",
                  ]}
                />
                <ReferenceLine y={0} stroke="#0F172A" strokeWidth={1.5} />
                <Bar dataKey="fluxo" radius={[4, 4, 0, 0]}>
                  {dadosFluxoCaixa.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fluxo >= 0 ? "#10B981" : "#EF4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
