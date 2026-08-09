import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { FormularioImovelFinanciamento } from "./components/FormularioImovelFinanciamento";
import { DashboardComparativo } from "./components/DashboardComparativo";
import { DadosImovel, DadosFinanciamento, ResultadoAluguel } from "./types";

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
  const [imovelSalvoId, setImovelSalvoId] = useState<string | null>(null);

  // Executa a simulação ao carregar a página para que os 4 GRÁFICOS APAREÇAM IMEDIATAMENTE
  useEffect(() => {
    executarSimulacao();
  }, []);

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
    setImovelSalvoId(null);
  };

  // BOTÃO 1: "Salvar no Banco de Dados" (APENAS DADOS DE ENTRADA IMÓVEL + FINANCIAMENTO)
  const handleSalvarNoBanco = async () => {
    if (!dadosImovel.cep) {
      setMensagemBanco("⚠️ Por favor, informe pelo menos o CEP para salvar o imóvel no banco.");
      return;
    }

    setSalvandoBanco(true);
    setMensagemBanco(null);

    const payloadImovel = {
      endereco: dadosImovel.endereco || "Endereço em cadastro",
      cidade: dadosImovel.cidade || "Cidade não informada",
      estado: dadosImovel.estado || "UF",
      cep: dadosImovel.cep,
      valor_compra: dadosImovel.valorCompra || 0,
      data_compra: dadosImovel.dataCompra,
      custo_aquisicao_extra: dadosImovel.custoAquisicaoExtra || 0,
      valor_mercado_atual: dadosImovel.valorMercadoAtual || dadosImovel.valorCompra || 0,
      banco: dadosFinanciamento.banco || "Caixa Econômica Federal",
      valor_financiado: dadosFinanciamento.valorFinanciado || 0,
      taxa_juros_anual: dadosFinanciamento.taxaJurosAnual || 0,
      sistema_amortizacao: dadosFinanciamento.sistemaAmortizacao || "SAC",
      numero_parcelas_total: dadosFinanciamento.numeroParcelasTotal || 360,
      parcelas_pagas: dadosFinanciamento.parcelasPagas || 0,
      saldo_devedor_manual: dadosFinanciamento.saldoDevedorAtual || 0,
    };

    try {
      const resImovel = await fetch("/api/imoveis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadImovel),
      });

      if (resImovel.ok) {
        const imovelCriado = await resImovel.json();
        setImovelSalvoId(imovelCriado.id);
        setMensagemBanco(
          `✅ Sucesso! Dados cadastrais do Imóvel & Financiamento gravados no banco de dados.`
        );
      } else {
        const errData = await resImovel.json().catch(() => ({}));
        setMensagemBanco(
          `❌ ${errData.error || errData.detalhe || "Erro ao salvar no banco. Verifique os campos."}`
        );
      }
    } catch (e) {
      // Fallback para persistência local (LocalStorage)
      try {
        const historicoLocal = JSON.parse(localStorage.getItem("imoveis_salvos") || "[]");
        const novoIdLocal = "local_" + Date.now();
        historicoLocal.push({ id: novoIdLocal, ...payloadImovel, data_criacao: new Date().toISOString() });
        localStorage.setItem("imoveis_salvos", JSON.stringify(historicoLocal));
        setImovelSalvoId(novoIdLocal);
        setMensagemBanco("✅ Sucesso! Imóvel & Financiamento salvos no banco local com sucesso.");
      } catch (errLocal) {
        setMensagemBanco("❌ Falha de conexão ao salvar no banco de dados.");
      }
    } finally {
      setSalvandoBanco(false);
    }
  };

  // BOTÃO 2: "Gerar Comparativo" (RODA CÁLCULOS FISCAIS/FINANCEIROS E RENDERIZA OS 4 GRÁFICOS)
  const executarSimulacao = async () => {
    try {
      const payload = {
        valorMercadoAtual: dadosImovel.valorMercadoAtual || dadosImovel.valorCompra || 400000,
        saldoDevedorAtual: dadosFinanciamento.saldoDevedorAtual || 240000,
        taxaJurosFinanciamentoAnual: dadosFinanciamento.taxaJurosAnual || 9.5,
        sistemaAmortizacao: dadosFinanciamento.sistemaAmortizacao,
        parcelasRestantes: Math.max(
          1,
          (dadosFinanciamento.numeroParcelasTotal || 360) - (dadosFinanciamento.parcelasPagas || 24)
        ),
        valorParcelaAtual: dadosFinanciamento.valorParcelaAtual || 2400,
        valorAluguelMensal: valorAluguelMensal || 2800,
        custosMensaisExtras,
        taxaValorizacaoAnualEstimada: taxaValorizacaoEstimada,
        taxaCDIAnualRef: taxaCDIAnual,
        valorCompra: dadosImovel.valorCompra || 350000,
        custoAquisicaoExtra: dadosImovel.custoAquisicaoExtra || 51110,
        anoCompra: dadosImovel.anoCompra || 2026,
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

        // Rolar suavemente até o dashboard de gráficos
        setTimeout(() => {
          const el = document.getElementById("simulador");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (e) {
      console.warn("Simulação cliente offline", e);
    }
  };

  // AÇÃO OPCIONAL DENTRO DO DASHBOARD: "Salvar Simulação no Histórico do Banco"
  const handleSalvarSimulacaoHistorico = async () => {
    if (!resultado) return;

    try {
      await fetch("/api/simulacoes/aluguel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imovelId: imovelSalvoId || undefined,
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
        }),
      });
    } catch (e) {
      const histSimulacoes = JSON.parse(localStorage.getItem("simulacoes_salvas") || "[]");
      histSimulacoes.push({ imovelId: imovelSalvoId, resultado, data: new Date().toISOString() });
      localStorage.setItem("simulacoes_salvas", JSON.stringify(histSimulacoes));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header onNovaAnalise={handleNovaAnalise} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Formulário de Entrada com CEP Automático */}
        <FormularioImovelFinanciamento
          dadosImovel={dadosImovel}
          setDadosImovel={setDadosImovel}
          dadosFinanciamento={dadosFinanciamento}
          setDadosFinanciamento={setDadosFinanciamento}
          onSimular={executarSimulacao}
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
            onSalvarSimulacaoHistorico={handleSalvarSimulacaoHistorico}
          />
        )}
      </main>
    </div>
  );
};
