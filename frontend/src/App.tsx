import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { FormularioImovelFinanciamento } from "./components/FormularioImovelFinanciamento";
import { DashboardComparativo } from "./components/DashboardComparativo";
import { DadosImovel, DadosFinanciamento, ResultadoAluguel } from "./types";

export const App: React.FC = () => {
  const [dadosImovel, setDadosImovel] = useState<DadosImovel>({
    endereco: "Av. Brigadeiro Faria Lima, 2000 - Pinheiros",
    cidade: "São Paulo",
    estado: "SP",
    cep: "05426-200",
    valorCompra: 450000,
    dataCompra: "2020-05-15",
    anoCompra: 2020,
    custoAquisicaoExtra: 25000,
    valorMercadoAtual: 680000,
    isUnicoImovelAte440k: false,
    reinvestimento180Dias: false,
  });

  const [dadosFinanciamento, setDadosFinanciamento] = useState<DadosFinanciamento>({
    banco: "Caixa Econômica Federal",
    valorFinanciado: 360000,
    taxaJurosAnual: 9.5,
    sistemaAmortizacao: "SAC",
    numeroParcelasTotal: 360,
    parcelasPagas: 48,
    saldoDevedorAtual: 312000,
    valorParcelaAtual: 3100,
  });

  // Parâmetros de Simulação de Aluguel e Investimentos
  const [valorAluguelMensal, setValorAluguelMensal] = useState<number>(3800);
  const [custosMensaisExtras, setCustosMensaisExtras] = useState<number>(300);
  const [taxaValorizacaoEstimada, setTaxaValorizacaoEstimada] = useState<number>(7.2);
  const [taxaCDIAnual, setTaxaCDIAnual] = useState<number>(10.5);

  const [resultado, setResultado] = useState<ResultadoAluguel | null>(null);

  // Executa a simulação sempre que os parâmetros mudarem
  useEffect(() => {
    executarSimulacao();
  }, [
    dadosImovel,
    dadosFinanciamento,
    valorAluguelMensal,
    custosMensaisExtras,
    taxaValorizacaoEstimada,
    taxaCDIAnual,
  ]);

  const executarSimulacao = async () => {
    try {
      const payload = {
        valorMercadoAtual: dadosImovel.valorMercadoAtual || dadosImovel.valorCompra,
        saldoDevedorAtual: dadosFinanciamento.saldoDevedorAtual,
        taxaJurosFinanciamentoAnual: dadosFinanciamento.taxaJurosAnual,
        sistemaAmortizacao: dadosFinanciamento.sistemaAmortizacao,
        parcelasRestantes: Math.max(
          1,
          dadosFinanciamento.numeroParcelasTotal - dadosFinanciamento.parcelasPagas
        ),
        valorParcelaAtual: dadosFinanciamento.valorParcelaAtual,
        valorAluguelMensal,
        custosMensaisExtras,
        taxaValorizacaoAnualEstimada: taxaValorizacaoEstimada,
        taxaCDIAnualRef: taxaCDIAnual,
        valorCompra: dadosImovel.valorCompra,
        custoAquisicaoExtra: dadosImovel.custoAquisicaoExtra,
        anoCompra: dadosImovel.anoCompra,
        percentualCorretagem: 6,
        isUnicoImovelAte440k: dadosImovel.isUnicoImovelAte440k,
        reinvestimento180Dias: dadosImovel.reinvestimento180Dias,
      };

      const response = await fetch("/api/simulacoes/aluguel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data: ResultadoAluguel = await response.json();
        setResultado(data);
      }
    } catch (e) {
      console.warn("Executando cálculo cliente offline", e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Banner de Apresentação Hero */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 card-shadow flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 text-xs font-extrabold uppercase tracking-wider rounded-lg border border-teal-200/60">
              Tomada de Decisão Financeira
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Vender o imóvel financiado agora ou alugar para quitar?
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Descubra matematicamente qual decisão maximiza seu patrimônio no médio e longo prazo, considerando amortização acelerada, imposto de renda sobre ganho de capital, valorização imobiliária por endereço e custo de oportunidade no CDI.
            </p>
          </div>

          {/* Card Resumo do Imóvel Selecionado */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 min-w-[280px] w-full lg:w-auto">
            <span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest block mb-1">
              Imóvel em Análise
            </span>
            <h4 className="text-sm font-bold text-white truncate max-w-[240px]">
              {dadosImovel.endereco || "Endereço não informado"}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {dadosImovel.cidade}/{dadosImovel.estado}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Mercado Atual</span>
                <span className="font-extrabold text-teal-300">
                  R$ {(dadosImovel.valorMercadoAtual || 0).toLocaleString("pt-BR")}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Saldo Devedor</span>
                <span className="font-extrabold text-amber-400">
                  R$ {(dadosFinanciamento.saldoDevedorAtual || 0).toLocaleString("pt-BR")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de Entrada com 2 Blocos */}
        <FormularioImovelFinanciamento
          dadosImovel={dadosImovel}
          setDadosImovel={setDadosImovel}
          dadosFinanciamento={dadosFinanciamento}
          setDadosFinanciamento={setDadosFinanciamento}
          onSimular={executarSimulacao}
          taxaValorizacaoEstimada={taxaValorizacaoEstimada}
          setTaxaValorizacaoEstimada={setTaxaValorizacaoEstimada}
        />

        {/* Dashboard de Comparação e Donut Chart */}
        {resultado && (
          <DashboardComparativo
            resultado={resultado}
            valorAluguelMensal={valorAluguelMensal}
            setValorAluguelMensal={setValorAluguelMensal}
            custosMensaisExtras={custosMensaisExtras}
            setCustosMensaisExtras={setCustosMensaisExtras}
            taxaValorizacaoAnual={taxaValorizacaoEstimada}
            setTaxaValorizacaoAnual={setTaxaValorizacaoEstimada}
            taxaCDIAnual={taxaCDIAnual}
            setTaxaCDIAnual={setTaxaCDIAnual}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} ImóvelWise. Sistema de Análise Financeira de Venda vs. Aluguel de Imóveis Financiados.
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Regras fiscais conforme legislação vigente (Ganho de Capital IRPF, Lei nº 7.713/88, Lei nº 13.259/2016).
          </p>
        </div>
      </footer>
    </div>
  );
};
