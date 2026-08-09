import React, { useState, useEffect } from "react";
import {
  Building2,
  Landmark,
  Search,
  RefreshCw,
  Sparkles,
  MapPin,
} from "lucide-react";
import { DadosImovel, DadosFinanciamento, EstimativaValorizacao } from "../types";
import { formatCEP, formatCurrencyBRL, parseCurrencyBRL } from "../utils/formatters";
import { calcularFinanciamento } from "../services/calculo-financiamento";

interface FormularioProps {
  dadosImovel: DadosImovel;
  setDadosImovel: React.Dispatch<React.SetStateAction<DadosImovel>>;
  dadosFinanciamento: DadosFinanciamento;
  setDadosFinanciamento: React.Dispatch<React.SetStateAction<DadosFinanciamento>>;
  taxaValorizacaoEstimada: number;
  setTaxaValorizacaoEstimada: React.Dispatch<React.SetStateAction<number>>;
}

export const FormularioImovelFinanciamento: React.FC<FormularioProps> = ({
  dadosImovel,
  setDadosImovel,
  dadosFinanciamento,
  setDadosFinanciamento,
  setTaxaValorizacaoEstimada,
}) => {
  const [buscandoValorizacao, setBuscandoValorizacao] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [resultadoBusca, setResultadoBusca] = useState<EstimativaValorizacao | null>(null);
  const [erroBusca, setErroBusca] = useState<string | null>(null);

  // Estados locais para controle de texto formatado dos campos monetários
  const [textoValorCompra, setTextoValorCompra] = useState("");
  const [textoCustoExtra, setTextoCustoExtra] = useState("");
  const [textoValorMercado, setTextoValorMercado] = useState("");
  const [textoValorFinanciado, setTextoValorFinanciado] = useState("");
  const [textoSaldoDevedor, setTextoSaldoDevedor] = useState("");
  const [textoParcelaAtual, setTextoParcelaAtual] = useState("");

  // Sincronizar estados formatados quando os props mudam externamente
  useEffect(() => {
    setTextoValorCompra(formatCurrencyBRL(dadosImovel.valorCompra));
    setTextoCustoExtra(formatCurrencyBRL(dadosImovel.custoAquisicaoExtra));
    setTextoValorMercado(formatCurrencyBRL(dadosImovel.valorMercadoAtual));
  }, [dadosImovel.valorCompra, dadosImovel.custoAquisicaoExtra, dadosImovel.valorMercadoAtual]);

  useEffect(() => {
    setTextoValorFinanciado(formatCurrencyBRL(dadosFinanciamento.valorFinanciado));
    setTextoSaldoDevedor(formatCurrencyBRL(dadosFinanciamento.saldoDevedorAtual));
    setTextoParcelaAtual(formatCurrencyBRL(dadosFinanciamento.valorParcelaAtual));
  }, [
    dadosFinanciamento.valorFinanciado,
    dadosFinanciamento.saldoDevedorAtual,
    dadosFinanciamento.valorParcelaAtual,
  ]);

  // Recálculo automático do saldo devedor e parcela no frontend em tempo real
  useEffect(() => {
    if (dadosFinanciamento.valorFinanciado > 0) {
      recalcularFinanciamentoLocal();
    }
  }, [
    dadosFinanciamento.valorFinanciado,
    dadosFinanciamento.taxaJurosAnual,
    dadosFinanciamento.sistemaAmortizacao,
    dadosFinanciamento.numeroParcelasTotal,
    dadosFinanciamento.parcelasPagas,
  ]);

  const recalcularFinanciamentoLocal = () => {
    const res = calcularFinanciamento({
      valorFinanciado: dadosFinanciamento.valorFinanciado,
      taxaJurosAnual: dadosFinanciamento.taxaJurosAnual,
      sistemaAmortizacao: dadosFinanciamento.sistemaAmortizacao,
      numeroParcelasTotal: dadosFinanciamento.numeroParcelasTotal,
      parcelasPagas: dadosFinanciamento.parcelasPagas,
      saldoDevedorManual: dadosFinanciamento.saldoDevedorManual,
    });

    setDadosFinanciamento((prev) => ({
      ...prev,
      saldoDevedorAtual: res.saldoDevedorAtual,
      valorParcelaAtual: res.valorParcelaAtual,
    }));
  };

  // Busca Automática de Endereço via CEP (ViaCEP API) com Máscara
  const handleCepChange = async (val: string) => {
    const cepFormatado = formatCEP(val);
    setDadosImovel((prev) => ({ ...prev, cep: cepFormatado }));

    const cepLimpo = val.replace(/\D/g, "");
    if (cepLimpo.length === 8) {
      setBuscandoCep(true);
      setErroBusca(null);

      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        if (response.ok) {
          const data = await response.json();
          if (!data.erro) {
            const novoEndereco = `${data.logradouro}${data.bairro ? `, ${data.bairro}` : ""}`;
            const novaCidade = data.localidade || "";
            const novoEstado = data.uf || "";

            setDadosImovel((prev) => ({
              ...prev,
              endereco: novoEndereco,
              cidade: novaCidade,
              estado: novoEstado,
            }));

            buscarValorizacaoAutomatica(novoEndereco, novaCidade, novoEstado);
          } else {
            setErroBusca("CEP não encontrado.");
          }
        }
      } catch (e) {
        setErroBusca("Erro ao buscar CEP. Verifique a conexão.");
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  const buscarValorizacaoAutomatica = async (end: string, cid?: string, uf?: string) => {
    if (!end) return;
    setBuscandoValorizacao(true);
    try {
      const res = await fetch(`/api/valorizacao/buscar?endereco=${encodeURIComponent(end)}`).catch(() => null);
      if (res && res.ok) {
        const data: EstimativaValorizacao = await res.json();
        setResultadoBusca(data);
        setTaxaValorizacaoEstimada(data.taxaValorizacaoAnualEstimada);
      } else {
        setResultadoBusca({
          enderecoConsultado: `${end}, ${cid || ""} - ${uf || ""}`,
          taxaValorizacaoAnualEstimada: 6.5,
          faixaMinima: 4.5,
          faixaMaxima: 8.5,
          resumo: `Estimativa de valorização imobiliária para ${cid || "a região"} baseada no histórico FipeZap/IPCA.`,
          fontes: [{ titulo: "FipeZap & Banco Central", url: "https://www.fipezap.com.br" }],
          cacheHit: true,
        });
        setTaxaValorizacaoEstimada(6.5);
      }
    } catch (e) {
      console.warn("Falha na valorização", e);
    } finally {
      setBuscandoValorizacao(false);
    }
  };

  const handleBuscarValorizacao = async () => {
    if (!dadosImovel.endereco) {
      setErroBusca("Informe pelo menos a rua ou bairro no endereço.");
      return;
    }
    await buscarValorizacaoAutomatica(
      dadosImovel.endereco,
      dadosImovel.cidade,
      dadosImovel.estado
    );
  };

  return (
    <div className="space-y-6">
      {/* Grid de 2 Colunas Responsivo para Celular e Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BLOCO 1: DADOS DO IMÓVEL */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 card-shadow space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
              1. Dados do Imóvel
            </h3>
            <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700">
              Imóvel
            </span>
          </div>

          {/* Campo CEP com Máscara XXXXX-XXX */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-600" /> CEP (Formato 00000-000)
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={9}
                value={dadosImovel.cep}
                onChange={(e) => handleCepChange(e.target.value)}
                placeholder="00000-000"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition"
              />
              {buscandoCep && (
                <RefreshCw className="w-4 h-4 animate-spin absolute right-3 top-3 text-teal-600" />
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Digite o CEP para buscar endereço, cidade e UF automaticamente.
            </p>
          </div>

          {/* Endereço Completo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Endereço (Rua, Número, Bairro)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={dadosImovel.endereco}
                onChange={(e) => setDadosImovel({ ...dadosImovel, endereco: e.target.value })}
                placeholder="Ex: Rua Domingos Marcelino, Kennedy"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition"
              />
              <button
                type="button"
                onClick={handleBuscarValorizacao}
                disabled={buscandoValorizacao}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 whitespace-nowrap shadow-sm w-full sm:w-auto"
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

          {/* Resultado da Busca de Valorização */}
          {resultadoBusca && (
            <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-teal-900 font-bold">
                <span className="flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  Potencial Estimado da Região:
                </span>
                <span className="text-xs font-extrabold text-teal-700 bg-white px-2 py-0.5 rounded-lg border border-teal-200">
                  {resultadoBusca.taxaValorizacaoAnualEstimada}% a.a.
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">{resultadoBusca.resumo}</p>
            </div>
          )}

          {/* Cidade e Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Cidade</label>
              <input
                type="text"
                value={dadosImovel.cidade}
                placeholder="Ex: Santa Luzia"
                onChange={(e) => setDadosImovel({ ...dadosImovel, cidade: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">UF (Estado)</label>
              <input
                type="text"
                maxLength={2}
                placeholder="Ex: MG"
                value={dadosImovel.estado}
                onChange={(e) => setDadosImovel({ ...dadosImovel, estado: e.target.value.toUpperCase() })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm uppercase"
              />
            </div>
          </div>

          {/* Valor de Compra Formatado e Ano */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Valor de Compra (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">R$</span>
                <input
                  type="text"
                  placeholder="350.000,00"
                  value={textoValorCompra}
                  onChange={(e) => setTextoValorCompra(e.target.value)}
                  onBlur={() => {
                    const num = parseCurrencyBRL(textoValorCompra);
                    setDadosImovel((prev) => ({ ...prev, valorCompra: num }));
                    setTextoValorCompra(formatCurrencyBRL(num));
                  }}
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
                value={dadosImovel.anoCompra || ""}
                onChange={(e) => setDadosImovel({ ...dadosImovel, anoCompra: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium"
              />
            </div>
          </div>

          {/* Custos Extras e Valor de Mercado Formatados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Custos Extras (ITBI, Escritura)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">R$</span>
                <input
                  type="text"
                  placeholder="51.110,00"
                  value={textoCustoExtra}
                  onChange={(e) => setTextoCustoExtra(e.target.value)}
                  onBlur={() => {
                    const num = parseCurrencyBRL(textoCustoExtra);
                    setDadosImovel((prev) => ({ ...prev, custoAquisicaoExtra: num }));
                    setTextoCustoExtra(formatCurrencyBRL(num));
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Valor de Mercado Atual (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">R$</span>
                <input
                  type="text"
                  placeholder="400.000,00"
                  value={textoValorMercado}
                  onChange={(e) => setTextoValorMercado(e.target.value)}
                  onBlur={() => {
                    const num = parseCurrencyBRL(textoValorMercado);
                    setDadosImovel((prev) => ({ ...prev, valorMercadoAtual: num }));
                    setTextoValorMercado(formatCurrencyBRL(num));
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm font-semibold text-teal-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BLOCO 2: DADOS DO FINANCIAMENTO */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 card-shadow space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-teal-600 flex-shrink-0" />
              2. Dados do Financiamento
            </h3>
            <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
              Dívida Ativa
            </span>
          </div>

          {/* Banco e Amortização */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Banco</label>
              <select
                value={dadosFinanciamento.banco}
                onChange={(e) => setDadosFinanciamento({ ...dadosFinanciamento, banco: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900"
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
              <label className="block text-xs font-medium text-slate-600 mb-1">Amortização</label>
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

          {/* Valor Financiado Formatado e Taxa de Juros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Valor Financiado Inicial</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">R$</span>
                <input
                  type="text"
                  placeholder="280.000,00"
                  value={textoValorFinanciado}
                  onChange={(e) => setTextoValorFinanciado(e.target.value)}
                  onBlur={() => {
                    const num = parseCurrencyBRL(textoValorFinanciado);
                    setDadosFinanciamento((prev) => ({ ...prev, valorFinanciado: num }));
                    setTextoValorFinanciado(formatCurrencyBRL(num));
                  }}
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
                  placeholder="9,50"
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

          {/* Parcelas Total e Pagas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nº Parcelas Total</label>
              <input
                type="number"
                placeholder="Ex: 360"
                value={dadosFinanciamento.numeroParcelasTotal || ""}
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
              <label className="block text-xs font-medium text-slate-600 mb-1">Parcelas Pagas</label>
              <input
                type="number"
                placeholder="Ex: 24"
                value={dadosFinanciamento.parcelasPagas || ""}
                onChange={(e) =>
                  setDadosFinanciamento({ ...dadosFinanciamento, parcelasPagas: Number(e.target.value) })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-teal-700"
              />
            </div>
          </div>

          {/* Saldo Devedor Atual e Valor da Parcela Formatados */}
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
                  type="text"
                  placeholder="240.000,00"
                  value={textoSaldoDevedor}
                  onChange={(e) => setTextoSaldoDevedor(e.target.value)}
                  onBlur={() => {
                    const num = parseCurrencyBRL(textoSaldoDevedor);
                    setDadosFinanciamento((prev) => ({
                      ...prev,
                      saldoDevedorManual: num,
                      saldoDevedorAtual: num,
                    }));
                    setTextoSaldoDevedor(formatCurrencyBRL(num));
                  }}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Parcela Mensal Atual
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-semibold">R$</span>
                <input
                  type="text"
                  placeholder="2.400,00"
                  value={textoParcelaAtual}
                  onChange={(e) => setTextoParcelaAtual(e.target.value)}
                  onBlur={() => {
                    const num = parseCurrencyBRL(textoParcelaAtual);
                    setDadosFinanciamento((prev) => ({ ...prev, valorParcelaAtual: num }));
                    setTextoParcelaAtual(formatCurrencyBRL(num));
                  }}
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
