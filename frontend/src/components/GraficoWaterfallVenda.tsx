import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ResultadoVenda } from "../types";

interface GraficoWaterfallProps {
  resultadoVenda: ResultadoVenda;
}

export const GraficoWaterfallVenda: React.FC<GraficoWaterfallProps> = ({ resultadoVenda }) => {
  const {
    valorVenda,
    saldoDevedorAbatido,
    valorCorretagem,
    impostoRendaCalculado,
    totalTaxasExtras = 0,
    resultadoLiquido,
  } = resultadoVenda;

  const dadosWaterfall = [
    {
      nome: "Valor Venda",
      valor: Math.round(valorVenda),
      cor: "#1F809B", // Teal principal
    },
    {
      nome: "(-) Saldo Devedor",
      valor: Math.round(saldoDevedorAbatido),
      cor: "#EF4444", // Red
    },
    {
      nome: "(-) Corretagem (6%)",
      valor: Math.round(valorCorretagem),
      cor: "#64748B", // Slate
    },
    {
      nome: "(-) Imposto Renda",
      valor: Math.round(impostoRendaCalculado),
      cor: "#F59E0B", // Amber
    },
  ];

  if (totalTaxasExtras > 0) {
    dadosWaterfall.push({
      nome: "(-) Taxas Extras",
      valor: Math.round(totalTaxasExtras),
      cor: "#E11D48", // Rose
    });
  }

  dadosWaterfall.push({
    nome: "= Líquido Final",
    valor: Math.round(resultadoLiquido),
    cor: "#10B981", // Emerald Verde
  });

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
    <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-200 card-shadow space-y-4">
      <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600">
            Gráfico de Decomposição Financeira
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Cascata (Waterfall) do Resultado da Venda
          </h3>
          <p className="text-xs text-slate-500">
            Do valor bruto de venda até o valor líquido no bolso após liquidação da dívida e taxas.
          </p>
        </div>
        <span className="text-[10px] sm:text-xs font-extrabold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 self-start sm:self-auto">
          Visualização Oficial
        </span>
      </div>

      <div className="h-64 sm:h-80 w-full pt-2 sm:pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dadosWaterfall} margin={{ top: 15, right: 10, left: -10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              dataKey="nome"
              tick={{ fontSize: 10, fontWeight: "600", fill: "#334155" }}
              interval={0}
            />
            <YAxis tickFormatter={formatarMoedaResumida} tick={{ fontSize: 10, fill: "#64748B" }} />
            <Tooltip
              formatter={(val: number) => [
                `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                "Valor",
              ]}
            />
            <Bar dataKey="valor" radius={[8, 8, 0, 0]} barSize={45}>
              {dadosWaterfall.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.cor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
