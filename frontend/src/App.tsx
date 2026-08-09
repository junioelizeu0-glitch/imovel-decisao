import React, { useState } from "react";
import { Header } from "./components/Header";
import { FormularioImovelFinanciamento } from "./components/FormularioImovelFinanciamento";
import { DashboardComparativo } from "./components/DashboardComparativo";
import { DadosImovel, DadosFinanciamento, ResultadoAluguel } from "./types";

export const App: React.FC = () => {
  // Estado inicial limpo
  const [dadosImovel, setDadosImovel] = useState<DadosImovel>({
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

  const [dadosFinanciamento, setDadosFinanciamento] = useState<DadosFinanciamento>({
    banco: "Caixa Econômica Federal",
    valorFinanciado: 0,
    taxaJurosAnual: 0,
    sistemaAmortizacao: "SAC",
    numeroParcelasTotal: 0,
    parcelasPagas: 0,
    saldoDevedorAtual: 0,
    valorParcelaAtual: 0,
  });

  // Parâmetros de Simulação de Aluguel e Investimentos
  const [valorAluguelMensal, setValorAluguelMensal] = useState<number>(0);
  const [custosMensaisExtras, setCustosMensaisExtras] = useState<number>(0);
  const [taxaValorizacaoEstimada, setTaxaValorizacaoEstimada] = useState<number>(6.0);
  const [taxaCDIAnual, setTaxaCDIAnual] = useState<number>(10.5);

  const [resultado, setResultado] = useState<ResultadoAluguel | null>(null);

  // Estados de notificação
  const [salvandoBanco, setSalvandoBanco] = useState(false);
  const [mensagemBanco, setMensagemBanco] = useState<string | null>(null);
  const [imovelSalvoId, setImovelSalvoId] = useState<string | null>(null);

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
    if (!dadosImovel.endereco || !dadosImovel.cidade || !dadosImovel.cep) {
      setMensagemBanco("⚠️ Preencha pelo menos o CEP e endereço do imóvel antes de salvar no banco.");
      return;
    }

    setSalvandoBanco(true);
    setMensagemBanco(null);

    try {
      const resImovel = await fetch("/api/imoveis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endereco: dadosImovel.endereco,
          cidade: dadosImovel.cidade,
          estado: dadosImovel.estado,
          cep: dadosImovel.cep,
          valor_compra: dadosImovel.valorCompra,
          data_compra: dadosImovel.dataCompra,
          custo_aquisicao_extra: dadosImovel.custoAquisicaoExtra,
          valor_mercado_atual: dadosImovel.valorMercadoAtual || dadosImovel.valorCompra,
          banco: dadosFinanciamento.banco,
          valor_financiado: dadosFinanciamento.valorFinanciado,
          taxa_juros_anual: dadosFinanciamento.taxaJurosAnual,
          sistema_amortizacao: dadosFinanciamento.sistemaAmortizacao,
          numero_parcelas_total: dadosFinanciamento.numeroParcelasTotal,
          parcelas_pagas: dadosFinanciamento.parcelasPagas,
          saldo_devedor_manual: dadosFinanciamento.saldoDevedorAtual,
        }),
      });

      if (resImovel.ok) {
        const imovelCriado = await resImovel.json();
        setImovelSalvoId(imovelCriado.id);
        setMensagemBanco(
          `✅ Sucesso! Dados cadastrais do Imóvel & Financiamento gravados no banco (ID: ${imovelCriado.id}).`
        );
      } else {
        setMensagemBanco("❌ Erro ao salvar dados de entrada no banco. Verifique os campos.");
      }
    } catch (e) {
      setMensagemBanco("❌ Falha de conexão ao salvar no banco de dados.");
    } finally {
      setSalvandoBanco(false);
    }
  };

  // BOTÃO 2: "Gerar Comparativo" (RODA CÁLCULOS E EXIBE O DASHBOARD COM 4 GRÁFICOS RECHARTS)
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

        // Rolar suavemente até a seção de resultado/gráficos
        setTimeout(() => {
          const el = document.getElementById("simulador");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (e) {
      console.warn("Simulação cliente offline", e);
    }
  };

  // AÇÃO OPCIONAL NO DASHBOARD: "Salvar Simulação no Histórico do Banco"
  const handleSalvarSimulacaoHistorico = async () => {
    if (!resultado) return;

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

        {/* Dashboard de Comparação e 4 Gráficos Recharts (Exibido sempre que houver resultado de simulação) */}
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
