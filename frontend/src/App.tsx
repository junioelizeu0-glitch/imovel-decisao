import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { FormularioImovelFinanciamento } from "./components/FormularioImovelFinanciamento";
import { DashboardComparativo } from "./components/DashboardComparativo";
import { DadosImovel, DadosFinanciamento, ResultadoAluguel } from "./types";
import { calcularCenarioAluguel } from "./services/calculo-aluguel";

export const App: React.FC = () => {
  // Estado de entrada
  const [dadosImovel, setDadosImovel] = useState<DadosImovel>({
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    valorCompra: 350000,
    dataCompra: new Date().toISOString().split("T")[0],
    anoCompra: new Date().getFullYear(),
    custoAquisicaoExtra: 51110,
    valorMercadoAtual: 400000,
    isUnicoImovelAte440k: false,
    reinvestimento180Dias: false,
  });

  const [dadosFinanciamento, setDadosFinanciamento] = useState<DadosFinanciamento>({
    banco: "Caixa Econômica Federal",
    valorFinanciado: 280000,
    taxaJurosAnual: 9.5,
    sistemaAmortizacao: "SAC",
    numeroParcelasTotal: 360,
    parcelasPagas: 24,
    saldoDevedorAtual: 240000,
    valorParcelaAtual: 2400,
  });

  // Parâmetros de Simulação de Aluguel e Investimentos
  const [valorAluguelMensal, setValorAluguelMensal] = useState<number>(2800);
  const [custosMensaisExtras, setCustosMensaisExtras] = useState<number>(300);
  const [taxaValorizacaoEstimada, setTaxaValorizacaoEstimada] = useState<number>(6.0);
  const [taxaCDIAnual, setTaxaCDIAnual] = useState<number>(10.5);

  const [resultado, setResultado] = useState<ResultadoAluguel | null>(null);

  // Estados de notificação
  const [salvandoBanco, setSalvandoBanco] = useState(false);
  const [mensagemBanco, setMensagemBanco] = useState<string | null>(null);

  // Executa a simulação ao carregar a página para que os 4 GRÁFICOS APAREÇAM IMEDIATAMENTE
  useEffect(() => {
    executarSimulacao();
  }, [
    dadosImovel.valorCompra,
    dadosImovel.valorMercadoAtual,
    dadosImovel.custoAquisicaoExtra,
    dadosImovel.anoCompra,
    dadosFinanciamento.valorFinanciado,
    dadosFinanciamento.saldoDevedorAtual,
    dadosFinanciamento.taxaJurosAnual,
    dadosFinanciamento.sistemaAmortizacao,
    dadosFinanciamento.numeroParcelasTotal,
    dadosFinanciamento.parcelasPagas,
    dadosFinanciamento.valorParcelaAtual,
    valorAluguelMensal,
    custosMensaisExtras,
    taxaValorizacaoEstimada,
    taxaCDIAnual,
  ]);

  // Função para limpar todos os campos e iniciar nova análise
  const handleNovaAnalise = () => {
    setDadosImovel({
      endereco: "",
      cidade: "",
      estado: "",
      cep: "",
      valorCompra: 0,
      dataCompra: new Date().toISOString().split("T")[0],
      anoCompra: new Date().getFullYear(),
      custoAquisicaoExtra: 0,
      valorMercadoAtual: 0,
      isUnicoImovelAte440k: false,
      reinvestimento180Dias: false,
    });
    setDadosFinanciamento({
      banco: "Caixa Econômica Federal",
      valorFinanciado: 0,
      taxaJurosAnual: 0,
      sistemaAmortizacao: "SAC",
      numeroParcelasTotal: 0,
      parcelasPagas: 0,
      saldoDevedorAtual: 0,
      valorParcelaAtual: 0,
    });
    setValorAluguelMensal(0);
    setCustosMensaisExtras(0);
    setResultado(null);
    setMensagemBanco(null);
  };

  // BOTÃO 1: "Salvar Simulação" (SALVA A SIMULAÇÃO ATUAL)
  const handleSalvarNoBanco = async () => {
    setSalvandoBanco(true);
    setMensagemBanco(null);

    const payloadSimulacao = {
      id: "sim_" + Date.now(),
      dataCriacao: new Date().toISOString(),
      dadosImovel,
      dadosFinanciamento,
      valorAluguelMensal,
      custosMensaisExtras,
      taxaValorizacaoEstimada,
      taxaCDIAnual,
      resultado,
    };

    // Tentar persistir no backend se disponível
    try {
      await fetch("/api/simulacoes/aluguel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadSimulacao),
      }).catch(() => null);
    } catch (e) {
      // Silenciar erro backend
    }

    // Persistência garantida no navegador (LocalStorage)
    try {
      const historico = JSON.parse(localStorage.getItem("simulacoes_imovel_decisao") || "[]");
      historico.unshift(payloadSimulacao);
      localStorage.setItem("simulacoes_imovel_decisao", JSON.stringify(historico));

      setMensagemBanco("✅ Simulação salva com sucesso no histórico!");
    } catch (errLocal) {
      setMensagemBanco("❌ Não foi possível salvar a simulação.");
    } finally {
      setSalvandoBanco(false);
    }
  };

  // BOTÃO 2: "Gerar Comparativo" (RODA CÁLCULOS FISCAIS/FINANCEIROS E RENDERIZA OS 4 GRÁFICOS INSTANTANEAMENTE)
  const executarSimulacao = () => {
    const valorMercado = dadosImovel.valorMercadoAtual || dadosImovel.valorCompra || 400000;
    const saldoDevedor = dadosFinanciamento.saldoDevedorAtual || 240000;
    const taxaJuros = dadosFinanciamento.taxaJurosAnual || 9.5;
    const parcelasTotal = dadosFinanciamento.numeroParcelasTotal || 360;
    const parcelasPagas = dadosFinanciamento.parcelasPagas || 24;
    const parcelasRestantes = Math.max(1, parcelasTotal - parcelasPagas);
    const valorParcela = dadosFinanciamento.valorParcelaAtual || 2400;

    const resultadoCalculado = calcularCenarioAluguel({
      valorMercadoAtual: valorMercado,
      saldoDevedorAtual: saldoDevedor,
      taxaJurosFinanciamentoAnual: taxaJuros,
      sistemaAmortizacao: dadosFinanciamento.sistemaAmortizacao,
      parcelasRestantes,
      valorParcelaAtual: valorParcela,
      valorAluguelMensal: valorAluguelMensal || 2800,
      custosMensaisExtras,
      taxaValorizacaoAnualEstimada: taxaValorizacaoEstimada,
      taxaCDIAnualRef: taxaCDIAnual,
      parametrosVenda: {
        valorVenda: valorMercado,
        valorCompraOriginal: dadosImovel.valorCompra || 350000,
        custoAquisicaoExtra: dadosImovel.custoAquisicaoExtra || 51110,
        anoCompra: dadosImovel.anoCompra || 2026,
        saldoDevedorAtual: saldoDevedor,
        percentualCorretagem: 6,
        isUnicoImovelAte440k: dadosImovel.isUnicoImovelAte440k,
        reinvestimento180Dias: dadosImovel.reinvestimento180Dias,
      },
    });

    setResultado(resultadoCalculado);
  };

  const handleGerarComparativoComScroll = () => {
    executarSimulacao();
    setTimeout(() => {
      const el = document.getElementById("simulador");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header onNovaAnalise={handleNovaAnalise} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Formulário de Entrada com CEP Automático e Botão "Salvar Simulação" */}
        <FormularioImovelFinanciamento
          dadosImovel={dadosImovel}
          setDadosImovel={setDadosImovel}
          dadosFinanciamento={dadosFinanciamento}
          setDadosFinanciamento={setDadosFinanciamento}
          onSimular={handleGerarComparativoComScroll}
          onSalvarNoBanco={handleSalvarNoBanco}
          taxaValorizacaoEstimada={taxaValorizacaoEstimada}
          setTaxaValorizacaoEstimada={setTaxaValorizacaoEstimada}
          salvandoBanco={salvandoBanco}
          mensagemBanco={mensagemBanco}
        />

        {/* Dashboard de Comparação e 4 Gráficos Recharts */}
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
            onSalvarSimulacaoHistorico={handleSalvarNoBanco}
          />
        )}
      </main>
    </div>
  );
};
