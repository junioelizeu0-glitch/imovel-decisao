import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface DonutChartProps {
  valorAluguel: number;
  valorParcela: number;
  custosExtras: number;
  irAluguel: number;
  fluxoLiquido: number;
}

export const DonutChartCard: React.FC<DonutChartProps> = ({
  valorAluguel,
  valorParcela,
  custosExtras,
  irAluguel,
  fluxoLiquido,
}) => {
  const data = [
    { name: "Parcela Financiamento", value: valorParcela, color: "#1F809B" }, // Teal Inspiração
    { name: "Custos Extras (Cond./IPTU)", value: custosExtras, color: "#7DD3FC" }, // Light Blue
    { name: "Imposto de Renda (IRPF)", value: irAluguel, color: "#F59E0B" }, // Amber
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 card-shadow space-y-4">
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        Composição Mensal da Operação (Aluguel)
      </h4>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Gráfico Donut estilo imagem de inspiração */}
        <div className="relative w-44 h-44 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={72}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: number) =>
                  `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                }
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Texto centralizado estilo inspiração */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Fluxo Líquido
            </span>
            <span
              className={`text-sm font-extrabold ${
                fluxoLiquido >= 0 ? "text-teal-700" : "text-rose-600"
              }`}
            >
              R$ {fluxoLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Legenda Lateral estilo inspiração */}
        <div className="flex-1 space-y-3 w-full text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-teal-600"></span>
              <span className="text-slate-600 font-medium">Parcela Financiamento</span>
            </div>
            <span className="font-bold text-slate-900">
              R$ {valorParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sky-300"></span>
              <span className="text-slate-600 font-medium">Custos Mensais Extras</span>
            </div>
            <span className="font-bold text-slate-900">
              R$ {custosExtras.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="text-slate-600 font-medium">Imposto de Renda</span>
            </div>
            <span className="font-bold text-slate-900">
              R$ {irAluguel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm font-extrabold">
            <span className="text-slate-800">Aluguel Bruto Recebido</span>
            <span className="text-teal-600">
              R$ {valorAluguel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
