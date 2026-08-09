import React, { useState, useEffect } from "react";
import {
  DollarSign,
  ShieldCheck,
  ShoppingBag,
  Save,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { DadosImovel, DadosFinanciamento, ResultadoVenda, TaxaExtra } from "../types";
import { formatCurrencyBRL, parseCurrencyBRL } from "../utils/formatters";
import { calcularCenarioVenda } from "../services/regras-fiscais";
import { ListaDeducoesExtras } from "./ListaDeducoesExtras";

interface CardSimulacaoVendaProps {
  dadosImovel: DadosImovel;
  dadosFinanciamento: DadosFinanciamento;
  onResultadoVendaAtualizado: (res: ResultadoVenda) => void;
  onSalvarSimulacao?: () => Promise<void>;
  salvandoBanco?: boolean;
  mensagemBanco?: string | null;
}

export const CardSimulacaoVenda: React.FC<CardSimulacaoVendaProps> = ({
  dadosImovel,
  dadosFinanciamento,
  onResultadoVendaAtualizado,
  onSalvarSimulacao,
  salvandoBanco = false,
  mensagemBanco = null,
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
    <div className="space-y-6">
      {/* CARD 3: FORMULÁRIO DE SIMULAÇÃO DE VENDA */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
        {/* Cabeçalho limpo */}
        <div className="border-b border-slate-100 pb-3 sm:pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600 flex-shrink-0" />
              3. Simular Venda para Terceiro
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Abate automaticamente o saldo devedor do financiamento e calcula o valor líquido final.
            </p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            Cálculo Instantâneo
          </span>
        </div>

        <div className="space-y-4 text-xs">
          {/* ÚNICO CAMPO DE INPUT MANUAL: Valor de Venda (R$) */}
          <div className="bg-slate-50/70 p-3.5 sm:p-4 rounded-xl border border-slate-200/80 space-y-1.5">
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
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-sm sm:text-base font-extrabold text-slate-900 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Pré-preenchido com o valor de mercado. Altere este valor para recalcular instantaneamente as deduções.
            </p>
          </div>

          {/* DEDUÇÕES AUTOMÁTICAS */}
          {/* 1. Quitação do Saldo Devedor Puxado Automático */}
          <div className="flex justify-between py-2 border-b border-slate-100 text-rose-600">
            <span className="font-medium">(-) Quitação do Saldo Devedor (Puxado do Financiamento)</span>
            <span className="font-bold whitespace-nowrap ml-2">
              -R$ {resultadoVendaCompleto.saldoDevedorAbatido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* 2. Corretagem Imobiliária (6%) */}
          <div className="flex justify-between py-2 border-b border-slate-100 text-rose-600">
            <span className="font-medium">(-) Corretagem Imobiliária (6%)</span>
            <span className="font-semibold whitespace-nowrap ml-2">
              -R$ {resultadoVendaCompleto.valorCorretagem.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* 3. Imposto de Renda sobre Ganho de Capital com Badge ISENTO */}
          <div className="flex justify-between py-2 border-b border-slate-100 text-rose-600 items-center">
            <span className="flex items-center gap-1.5 font-medium">
              (-) Imposto de Renda (Ganho de Capital)
              {resultadoVendaCompleto.isentoIR && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                  ISENTO
                </span>
              )}
            </span>
            <span className="font-semibold whitespace-nowrap ml-2">
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

          {/* BOTÃO "SALVAR SIMULAÇÃO" APÓS O IMPOSTO/TAXAS, NO CANTO DIREITO (Estilo Column Royal Blue) */}
          {onSalvarSimulacao && (
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={onSalvarSimulacao}
                disabled={salvandoBanco}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {salvandoBanco ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Save className="w-4 h-4 text-white" />
                )}
                Salvar Simulação
              </button>
            </div>
          )}

          {/* Mensagem de confirmação de salvamento */}
          {mensagemBanco && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{mensagemBanco}</span>
            </div>
          )}
        </div>
      </div>

      {/* CARD SEPARADO: VALOR LÍQUIDO NO BOLSO AGORA (Estilo Column Bank UI) */}
      <div className="bg-slate-900 text-white rounded-xl p-5 sm:p-6 shadow-md border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] text-blue-400 uppercase tracking-widest font-bold block">
            VALOR LÍQUIDO NO BOLSO AGORA
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white mt-1 block tracking-tight">
            R$ {resultadoVendaCompleto.resultadoLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">
            Resultado final após quitar o financiamento e deduzir corretagem, IRPF e taxas extras.
          </p>
        </div>

        <div className="bg-blue-600/20 p-3.5 rounded-xl border border-blue-500/30 flex items-center gap-2 self-end sm:self-auto">
          <DollarSign className="w-7 h-7 text-blue-400" />
          <ArrowRight className="w-4 h-4 text-slate-400 hidden sm:block" />
        </div>
      </div>
    </div>
  );
};
