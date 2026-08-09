import React, { useState, useEffect } from "react";
import { DollarSign, ShieldCheck, Tag, ShoppingBag } from "lucide-react";
import { DadosImovel, DadosFinanciamento, ResultadoVenda, TaxaExtra } from "../types";
import { formatCurrencyBRL, parseCurrencyBRL } from "../utils/formatters";
import { calcularCenarioVenda } from "../services/regras-fiscais";
import { ListaDeducoesExtras } from "./ListaDeducoesExtras";

interface CardSimulacaoVendaProps {
  dadosImovel: DadosImovel;
  dadosFinanciamento: DadosFinanciamento;
  onResultadoVendaAtualizado: (res: ResultadoVenda) => void;
}

export const CardSimulacaoVenda: React.FC<CardSimulacaoVendaProps> = ({
  dadosImovel,
  dadosFinanciamento,
  onResultadoVendaAtualizado,
}) => {
  // Estado local para o único campo de input manual: Valor de Venda (R$)
  const valorMercadoInicial = dadosImovel.valorMercadoAtual || dadosImovel.valorCompra || 400000;
  const [valorVendaInput, setValorVendaInput] = useState<number>(valorMercadoInicial);
  const [textoValorVenda, setTextoValorVenda] = useState<string>(
    formatCurrencyBRL(valorMercadoInicial)
  );

  // Lista de Taxas e Impostos Extras Dinâmicos
  const [taxasExtras, setTaxasExtras] = useState<TaxaExtra[]>([]);

  // Sincronizar quando o valor de mercado muda no cadastro
  useEffect(() => {
    const val = dadosImovel.valorMercadoAtual || dadosImovel.valorCompra || 400000;
    setValorVendaInput(val);
    setTextoValorVenda(formatCurrencyBRL(val));
  }, [dadosImovel.valorMercadoAtual, dadosImovel.valorCompra]);

  // Recálculo automático em tempo real sempre que o Valor de Venda, Financiamento ou Taxas mudam
  const totalTaxasExtras = taxasExtras.reduce((acc, t) => {
    if (t.tipo === "PERCENTUAL") {
      return acc + (t.valor / 100) * valorVendaInput;
    }
    return acc + t.valor;
  }, 0);

  const resultadoVendaBase = calcularCenarioVenda({
    valorVenda: valorVendaInput > 0 ? valorVendaInput : 400000,
    valorCompraOriginal: dadosImovel.valorCompra || 350000,
    custoAquisicaoExtra: dadosImovel.custoAquisicaoExtra || 51110,
    anoCompra: dadosImovel.anoCompra || 2026,
    saldoDevedorAtual: dadosFinanciamento.saldoDevedorAtual,
    percentualCorretagem: 6,
    isUnicoImovelAte440k: dadosImovel.isUnicoImovelAte440k,
    reinvestimento180Dias: dadosImovel.reinvestimento180Dias,
  });

  const resultadoLiquidoFinal = Math.max(
    0,
    resultadoVendaBase.resultadoLiquido - totalTaxasExtras
  );

  const resultadoVendaCompleto: ResultadoVenda = {
    ...resultadoVendaBase,
    resultadoLiquido: resultadoLiquidoFinal,
    taxasExtras,
    totalTaxasExtras,
  };

  // Notificar o componente pai sobre o resultado atualizado para os gráficos e insights
  useEffect(() => {
    onResultadoVendaAtualizado(resultadoVendaCompleto);
  }, [
    valorVendaInput,
    dadosFinanciamento.saldoDevedorAtual,
    dadosImovel.valorCompra,
    dadosImovel.custoAquisicaoExtra,
    taxasExtras,
  ]);

  const handleAdicionarTaxa = (novaTaxa: TaxaExtra) => {
    setTaxasExtras((prev) => [...prev, novaTaxa]);
  };

  const handleRemoverTaxa = (id: string) => {
    setTaxasExtras((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 card-shadow space-y-6">
      {/* Cabeçalho no mesmo padrão dos blocos 1 e 2 */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-teal-600" />
          3. Simular Venda para Terceiro
        </h3>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
          Liquidez em Tempo Real
        </span>
      </div>

      <div className="space-y-4 text-xs">
        {/* ÚNICO CAMPO DE INPUT MANUAL: Valor de Venda (R$) */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Valor de Venda Simulado (R$)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">R$</span>
            <input
              type="text"
              value={textoValorVenda}
              onChange={(e) => {
                setTextoValorVenda(e.target.value);
                const num = parseCurrencyBRL(e.target.value);
                setValorVendaInput(num);
              }}
              onBlur={() => {
                const num = parseCurrencyBRL(textoValorVenda);
                setValorVendaInput(num);
                setTextoValorVenda(formatCurrencyBRL(num));
              }}
              placeholder="400.000,00"
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-base font-extrabold text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Pré-preenchido com o valor de mercado. Altere este valor para recalcular instantaneamente as deduções.
          </p>
        </div>

        {/* DEDUÇÕES AUTOMÁTICAS */}
        {/* 1. Quitação do Saldo Devedor Puxado Automático */}
        <div className="flex justify-between py-2 border-b border-slate-100 text-rose-600">
          <span>(-) Quitação do Saldo Devedor (Puxado do Financiamento)</span>
          <span className="font-bold">
            -R$ {resultadoVendaCompleto.saldoDevedorAbatido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* 2. Corretagem Imobiliária (6%) */}
        <div className="flex justify-between py-2 border-b border-slate-100 text-rose-600">
          <span>(-) Corretagem Imobiliária (6%)</span>
          <span className="font-semibold">
            -R$ {resultadoVendaCompleto.valorCorretagem.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* 3. Imposto de Renda sobre Ganho de Capital com Badge ISENTO */}
        <div className="flex justify-between py-2 border-b border-slate-100 text-rose-600 items-center">
          <span className="flex items-center gap-1.5">
            (-) Imposto de Renda (Ganho de Capital)
            {resultadoVendaCompleto.isentoIR && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                ISENTO
              </span>
            )}
          </span>
          <span className="font-semibold">
            -R$ {resultadoVendaCompleto.impostoRendaCalculado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Motivo de Isenção ou Alerta */}
        {resultadoVendaCompleto.isentoIR && (
          <div className="p-2.5 bg-emerald-50 text-emerald-800 text-[11px] rounded-xl border border-emerald-100 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{resultadoVendaCompleto.motivoIsencao}</span>
          </div>
        )}

        {/* COMPONENTE REUTILIZÁVEL: Lista de Deduções e Taxas Extras Dinâmicas */}
        <ListaDeducoesExtras
          taxasExtras={taxasExtras}
          onAdicionarTaxa={handleAdicionarTaxa}
          onRemoverTaxa={handleRemoverTaxa}
          valorVendaBase={valorVendaInput}
        />

        {/* VALOR LÍQUIDO NO BOLSO AGORA (CARD DE DESTAQUE) */}
        <div className="p-5 bg-slate-900 text-white rounded-2xl flex items-center justify-between mt-4 shadow-md">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
              VALOR LÍQUIDO NO BOLSO AGORA
            </span>
            <span className="text-2xl font-black text-teal-400 mt-0.5 block">
              R$ {resultadoVendaCompleto.resultadoLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <DollarSign className="w-10 h-10 text-teal-400/30" />
        </div>
      </div>
    </div>
  );
};
