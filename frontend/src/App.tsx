import React, { useState } from "react";
import { Header } from "./components/Header";
import { FormularioImovelFinanciamento } from "./components/FormularioImovelFinanciamento";
import { CardSimulacaoVenda } from "./components/CardSimulacaoVenda";
import { GraficoWaterfallVenda } from "./components/GraficoWaterfallVenda";
import { InsightsInteligentes } from "./components/InsightsInteligentes";
import { DadosImovel, DadosFinanciamento, ResultadoVenda } from "./types";

export const App: React.FC = () => {
  // Estado inicial dos dados do Imóvel
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

  // Estado inicial dos dados do Financiamento
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

  // Resultado compilado da simulação de venda para os gráficos e insights
  const [resultadoVendaAtual, setResultadoVendaAtual] = useState<ResultadoVenda | null>(null);

  // Estados de notificação do botão Salvar Simulação
  const [salvandoBanco, setSalvandoBanco] = useState(false);
  const [mensagemBanco, setMensagemBanco] = useState<string | null>(null);

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
    setMensagemBanco(null);
  };

  // BOTÃO: "Salvar Simulação" (localizado dentro do CardSimulacaoVenda)
  const handleSalvarSimulacao = async () => {
    setSalvandoBanco(true);
    setMensagemBanco(null);

    const payloadSimulacao = {
      id: "sim_venda_" + Date.now(),
      dataCriacao: new Date().toISOString(),
      dadosImovel,
      dadosFinanciamento,
      resultadoVendaAtual,
    };

    try {
      await fetch("/api/simulacoes/venda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadSimulacao),
      }).catch(() => null);
    } catch (e) {
      // Silenciar erro backend
    }

    try {
      const historico = JSON.parse(localStorage.getItem("simulacoes_venda_imovel") || "[]");
      historico.unshift(payloadSimulacao);
      localStorage.setItem("simulacoes_venda_imovel", JSON.stringify(historico));

      setMensagemBanco("✅ Simulação salva com sucesso no histórico!");
    } catch (errLocal) {
      setMensagemBanco("❌ Não foi possível salvar a simulação.");
    } finally {
      setSalvandoBanco(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header onNovaAnalise={handleNovaAnalise} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* Bloco 1: Dados do Imóvel + Bloco 2: Dados do Financiamento */}
        <FormularioImovelFinanciamento
          dadosImovel={dadosImovel}
          setDadosImovel={setDadosImovel}
          dadosFinanciamento={dadosFinanciamento}
          setDadosFinanciamento={setDadosFinanciamento}
          taxaValorizacaoEstimada={6.5}
          setTaxaValorizacaoEstimada={() => {}}
        />

        {/* Bloco 3: Simular Venda para Terceiro (com o botão Salvar Simulação embutido) */}
        <div id="simular-venda">
          <CardSimulacaoVenda
            dadosImovel={dadosImovel}
            dadosFinanciamento={dadosFinanciamento}
            onResultadoVendaAtualizado={setResultadoVendaAtual}
            onSalvarSimulacao={handleSalvarSimulacao}
            salvandoBanco={salvandoBanco}
            mensagemBanco={mensagemBanco}
          />
        </div>

        {/* Gráfico Único Waterfall & Insights Inteligentes */}
        {resultadoVendaAtual && (
          <div className="space-y-6 sm:space-y-8">
            {/* Gráfico 1: Waterfall da Venda em Destaque */}
            <GraficoWaterfallVenda resultadoVenda={resultadoVendaAtual} />

            {/* Insights Inteligentes */}
            <InsightsInteligentes
              resultadoVenda={resultadoVendaAtual}
              valorCompraOriginal={dadosImovel.valorCompra}
              custoAquisicaoExtra={dadosImovel.custoAquisicaoExtra}
              saldoDevedorAtual={dadosFinanciamento.saldoDevedorAtual}
            />
          </div>
        )}
      </main>
    </div>
  );
};
