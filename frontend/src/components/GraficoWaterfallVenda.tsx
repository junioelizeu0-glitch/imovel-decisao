import React, { useState, useEffect } from "react";
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

  // Estado para detectar se é tela mobile (< 640px)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const dadosWaterfall = [
    {
      nome: isMobile ? "Venda" : "Valor Venda",
      nomeCompleto: "Valor de Venda",
      valor: Math.round(valorVenda),
      cor: "#1F809B", // Teal principal
    },
    {
      nome: isMobile ? "(-) Saldo" : "(-) Saldo Devedor",
      nomeCompleto: "(-) Quitação Saldo Devedor",
      valor: Math.round(saldoDevedorAbatido),
      cor: "#EF4444", // Red
    },
    {
      nome: isMobile ? "(-) Corret." : "(-) Corretagem (6%)",
      nomeCompleto: "(-) Corretagem Imobiliária (6%)",
      valor: Math.round(valorCorretagem),
      cor: "#64748B", // Slate
    },
    {
      nome: isMobile ? "(-) IR" : "(-) Imposto Renda",
      nomeCompleto: "(-) Imposto de Renda (IRPF)",
      valor: Math.round(impostoRendaCalculado),
      cor: "#F59E0B", // Amber
    },
  ];

  if (totalTaxasExtras > 0) {
    dadosWaterfall.push({
      nome: isMobile ? "(-) Taxas" : "(-) Taxas Extras",
      nomeCompleto: "(-) Taxas Extras",
      valor: Math.round(totalTaxasExtras),
      cor: "#E11D48", // Rose
    });
  }

  dadosWaterfall.push({
    nome: isMobile ? "= Líquido" : "= Líquido Final",
    nomeCompleto: "= Valor Líquido no Bolso",
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
            Decomposição de Balanço
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

      {/* Container com scroll horizontal em celulares extremamente pequenos para garantir visualização limpa */}
      <div className="w-full overflow-x-auto">
        <div className="h-72 sm:h-80 min-w-[320px] sm:min-w-full pt-2 sm:pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dadosWaterfall}
              margin={
                isMobile
                  ? { top: 15, right: 10, left: -20, bottom: 35 }
                  : { top: 15, right: 15, left: -5, bottom: 25 }
              }
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="nome"
                tick={{
                  fontSize: isMobile ? 9 : 11,
                  fontWeight: "700",
                  fill: "#334155",
                }}
                interval={0}
                angle={isMobile ? -25 : 0}
                textAnchor={isMobile ? "end" : "middle"}
                height={isMobile ? 45 : 30}
              />
              <YAxis
                tickFormatter={formatarMoedaResumida}
                tick={{ fontSize: isMobile ? 9 : 11, fill: "#64748B" }}
                width={isMobile ? 45 : 60}
              />
              <Tooltip
                formatter={(val: number) => [
                  `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                  "Valor",
                ]}
                labelFormatter={(label: string) => {
                  const item = dadosWaterfall.find((d) => d.nome === label);
                  return item ? item.nomeCompleto : label;
                }}
                contentStyle={{
                  borderRadius: "12px",
                  borderColor: "#E2E8F0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="valor" radius={[8, 8, 0, 0]} barSize={isMobile ? 32 : 50}>
                {dadosWaterfall.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
