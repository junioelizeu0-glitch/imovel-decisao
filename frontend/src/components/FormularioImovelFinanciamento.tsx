import React, { useState, useEffect } from "react";
import {
  Building2,
  Landmark,
  Search,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  Sparkles,
  DollarSign,
  Calendar,
  Percent,
} from "lucide-react";
import { DadosImovel, DadosFinanciamento, EstimativaValorizacao } from "../types";

interface FormularioProps {
  dadosImovel: DadosImovel;
  setDadosImovel: React.Dispatch<React.SetStateAction<DadosImovel>>;
  dadosFinanciamento: DadosFinanciamento;
  setDadosFinanciamento: React.Dispatch<React.SetStateAction<DadosFinanciamento>>;
  onSimular: () => void;
  taxaValorizacaoEstimada: number;
  setTaxaValorizacaoEstimada: React.Dispatch<React.SetStateAction<number>>;
}

export const FormularioImovelFinanciamento: React.FC<FormularioProps> = ({
  dadosImovel,
  setDadosImovel,
  dadosFinanciamento,
  setDadosFinanciamento,
  onSimular,
  taxaValorizacaoEstimada,
  setTaxaValorizacaoEstimada,
}) => {
  const [buscandoValorizacao, setBuscandoValorizacao] = useState(false);
  const [resultadoBusca, setResultadoBusca] = useState<EstimativaValorizacao | null>(null);
  const [erroBusca, setErroBusca] = useState<string | null>(null);

  // Recálculo automático do saldo devedor e parcela quando dados do financiamento mudam
  useEffect(() => {
    recalcularFinanciamentoApi();
  }, [
    dadosFinanciamento.valorFinanciado,
    dadosFinanciamento.taxaJurosAnual,
    dadosFinanciamento.sistemaAmortizacao,
    dadosFinanciamento.numeroParcelasTotal,
    dadosFinanciamento.parcelasPagas,
  ]);

  const recalcularFinanciamentoApi = async () => {
    try {
      const res = await fetch("/api/financiamento/recalcular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valorFinanciado: dadosFinanciamento.valorFinanciado,
          taxaJurosAnual: dadosFinanciamento.taxaJurosAnual,
          sistemaAmortizacao: dadosFinanciamento.sistemaAmortizacao,
          numeroParcelasTotal: dadosFinanciamento.numeroParcelasTotal,
          parcelasPagas: dadosFinanciamento.parcelasPagas,
          saldoDevedorManual: dadosFinanciamento.saldoDevedorManual,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDadosFinanciamento((prev) => ({
          ...prev,
          saldoDevedorAtual: data.saldoDevedorAtual,
          valorParcelaAtual: Number(data.valorParcelaAtual.toFixed(2)),
        }));
      }
    } catch (e) {
      console.warn("Recálculo offline ativado", e);
    }
  };

  const handleBuscarValorizacao = async () => {
    if (!dadosImovel.endereco) {
      setErroBusca("Informe pelo menos a rua ou bairro no endereço.");
      return;
    }

    setBuscandoValorizacao(true);
    setErroBusca(null);

    try {
      const params = new URLSearchParams({
        endereco: dadosImovel.endereco,
        cidade: dadosImovel.cidade,
        estado: dadosImovel.estado,
      });

      const res = await fetch(`/api/valorizacao/buscar?${params}`);
      if (res.ok) {
        const data: EstimativaValorizacao = await res.json();
        setResultadoBusca(data);
        setTaxaValorizacaoEstimada(data.taxaValorizacaoAnualEstimada);
      } else {
        setErroBusca("Não foi possível realizar a busca automática no momento.");
      }
    } catch (e) {
      setErroBusca("Falha na conexão com o servidor de inteligência imobiliária.");
    } finally {
      setBuscandoValorizacao(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Título da Seção */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl card-shadow border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-teal-600" />
            Dados do Imóvel & Financiamento
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Preencha os dois blocos abaixo para gerar a análise comparativa automatizada de venda versus aluguel.
          </p>
        </div>
        <button
          onClick={onSimular}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          Gerar Comparativo Lado a Lado
        </button>
      </div>

      {/* Grid de 2 Colunas Lado a Lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BLOCO 1: DADOS DO IMÓVEL */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 card-shadow space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-600" />
              1. Dados do Imóvel
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700">
              Imóvel
            </span>
          </div>

          {/* Endereço Completo com Busca de Valorização */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Endereço do Imóvel (Rua, Bairro)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={dadosImovel.endereco}
                onChange={(e) => setDadosImovel({ ...dadosImovel, endereco: e.target.value })}
                placeholder="Ex: Av. Paulista, 1000 - Bela Vista"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition"
              />
              <button
                type="button"
                onClick={handleBuscarValorizacao}
                disabled={buscandoValorizacao}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap shadow-sm"
                title="Estimativa inteligente por endereço"
              >
                {buscandoValorizacao ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 text-amber-400" />
                )}
                Buscar Valorização
              </button>
            </div>
            {erroBusca && <p className="text-xs text-rose-500 mt-1">{erroBusca}</p>}
          </div>

          {/* Resultado da Busca de Valorização por Endereço */}
          {resultadoBusca && (
            <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-teal-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Potencial Estimado para a Região:
                </span>
                <span className="text-sm font-extrabold text-teal-700 bg-white px-2.5 py-0.5 rounded-lg border border-teal-200">
                  {resultadoBusca.taxaValorizacaoAnualEstimada}% a.a.
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">{resultadoBusca.resumo}</p>
              {resultadoBusca.fontes.length > 0 && (
                <div className="pt-1 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Fontes consultadas: </span>
                  {resultadoBusca.fontes.map((f, idx) => (
                    <a
                      key={idx}
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-teal-700 hover:text-teal-900 ml-1"
                    >
                      {f.titulo}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cidade, Estado e CEP */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Cidade</label>
              <input
                type="text"
                value={dadosImovel.cidade}
                onChange={(e) => setDadosImovel({ ...dadosImovel, cidade: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">UF</label>
              <input
                type="text"
                maxLength={2}
                value={dadosImovel.estado}
                onChange={(e) => setDadosImovel({ ...dadosImovel, estado: e.target.value.toUpperCase() })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">CEP</label>
              <input
                type="text"
                value={dadosImovel.cep}
                onChange={(e) => setDadosImovel({ ...dadosImovel, cep: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Valores de Compra e Custos Extras */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Valor de Compra (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">R$</span>
                <input
                  type="number"
                  value={dadosImovel.valorCompra || ""}
                  onChange={(e) => setDadosImovel({ ...dadosImovel, valorCompra: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm font-semibold text-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Ano de Aquisição
              </label>
              <input
                type="number"
                value={dadosImovel.anoCompra}
                onChange={(e) => setDadosImovel({ ...dadosImovel, anoCompra: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Custos de Aquisição Extras (ITBI, Escritura)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">R$</span>
                <input
                  type="number"
                  value={dadosImovel.custoAquisicaoExtra || ""}
                  onChange={(e) =>
                    setDadosImovel({ ...dadosImovel, custoAquisicaoExtra: Number(e.target.value) })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Valor de Mercado Atual Estimado (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">R$</span>
                <input
                  type="number"
                  value={dadosImovel.valorMercadoAtual || ""}
                  onChange={(e) =>
                    setDadosImovel({ ...dadosImovel, valorMercadoAtual: Number(e.target.value) })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm font-semibold text-teal-700"
                />
              </div>
            </div>
          </div>

          {/* Toggles de Isenção Fiscal */}
          <div className="pt-2 space-y-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={dadosImovel.isUnicoImovelAte440k}
                onChange={(e) => setDadosImovel({ ...dadosImovel, isUnicoImovelAte440k: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
              Único imóvel vendido por até R$ 440 mil (sem vendas nos últimos 5 anos)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={dadosImovel.reinvestimento180Dias}
                onChange={(e) => setDadosImovel({ ...dadosImovel, reinvestimento180Dias: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
              Pretendo reinvestir o valor em outro imóvel residencial em até 180 dias
            </label>
          </div>
        </div>

        {/* BLOCO 2: DADOS DO FINANCIAMENTO */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 card-shadow space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-teal-600" />
              2. Dados do Financiamento
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
              Dívida Ativa
            </span>
          </div>

          {/* Banco e Sistema de Amortização */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Instituição Financeira</label>
              <select
                value={dadosFinanciamento.banco}
                onChange={(e) => setDadosFinanciamento({ ...dadosFinanciamento, banco: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
              >
                <option value="Caixa Econômica Federal">Caixa Econômica Federal</option>
                <option value="Itaú Unibanco">Itaú Unibanco</option>
                <option value="Banco Bradesco">Banco Bradesco</option>
                <option value="Banco Santander">Banco Santander</option>
                <option value="Banco do Brasil">Banco do Brasil</option>
                <option value="Outro Banco">Outro Banco / Fintech</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Sistema de Amortização</label>
              <select
                value={dadosFinanciamento.sistemaAmortizacao}
                onChange={(e) =>
                  setDadosFinanciamento({
                    ...dadosFinanciamento,
                    sistemaAmortizacao: e.target.value as "SAC" | "PRICE",
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800"
              >
                <option value="SAC">SAC (Amortização Constante - Parcelas Decrescentes)</option>
                <option value="PRICE">PRICE (Tabela Price - Parcelas Fixas)</option>
              </select>
            </div>
          </div>

          {/* Valor Financiado e Taxa de Juros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Valor Financiado Inicial</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">R$</span>
                <input
                  type="number"
                  value={dadosFinanciamento.valorFinanciado || ""}
                  onChange={(e) =>
                    setDadosFinanciamento({ ...dadosFinanciamento, valorFinanciado: Number(e.target.value) })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm font-semibold text-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Taxa de Juros Anual (%)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={dadosFinanciamento.taxaJurosAnual || ""}
                  onChange={(e) =>
                    setDadosFinanciamento({ ...dadosFinanciamento, taxaJurosAnual: Number(e.target.value) })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-8 pl-3 py-2 text-sm font-semibold text-slate-900"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">% a.a.</span>
              </div>
            </div>
          </div>

          {/* Parcelas Total e Parcelas Pagas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nº Parcelas Contratadas</label>
              <input
                type="number"
                value={dadosFinanciamento.numeroParcelasTotal}
                onChange={(e) =>
                  setDadosFinanciamento({
                    ...dadosFinanciamento,
                    numeroParcelasTotal: Number(e.target.value),
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Parcelas Já Pagas</label>
              <input
                type="number"
                value={dadosFinanciamento.parcelasPagas}
                onChange={(e) =>
                  setDadosFinanciamento({ ...dadosFinanciamento, parcelasPagas: Number(e.target.value) })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-teal-700"
              />
            </div>
          </div>

          {/* Saldo Devedor Atual e Valor da Parcela Atual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Saldo Devedor Atual
                </label>
                <span className="text-[10px] text-slate-400">Editável</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-semibold">R$</span>
                <input
                  type="number"
                  value={dadosFinanciamento.saldoDevedorAtual || ""}
                  onChange={(e) =>
                    setDadosFinanciamento({
                      ...dadosFinanciamento,
                      saldoDevedorManual: Number(e.target.value),
                      saldoDevedorAtual: Number(e.target.value),
                    })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Valor da Parcela Mensal Atual
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-semibold">R$</span>
                <input
                  type="number"
                  value={dadosFinanciamento.valorParcelaAtual || ""}
                  onChange={(e) =>
                    setDadosFinanciamento({
                      ...dadosFinanciamento,
                      valorParcelaAtual: Number(e.target.value),
                    })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm font-bold text-teal-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
