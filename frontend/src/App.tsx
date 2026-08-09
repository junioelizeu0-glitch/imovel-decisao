import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { FormularioImovelFinanciamento } from "./components/FormularioImovelFinanciamento";
import { DashboardComparativo } from "./components/DashboardComparativo";
import { DadosImovel, DadosFinanciamento, ResultadoAluguel } from "./types";

export const App: React.FC = () => {
  // Estado com campos limpos por padrão
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

  // Estados de salvamento no banco de dados
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
    setValorAluguelMensal(0);
    setCustosMensaisExtras(0);
    setResultado(null);
    setMensagemBanco(null);
  };

  // Executa a simulação sempre que houver dados mínimos inseridos
  useEffect(() => {
    if (
      dadosImovel.valorCompra > 0 ||
      dadosFinanciamento.valorFinanciado > 0 ||
      valorAluguelMensal > 0
    ) {
      executarSimulacao();
    }
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
      console.warn("Simulação cliente offline", e);
    }
  };

  // Salva no banco de dados
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

        if (valorAluguelMensal > 0) {
          await fetch("/api/simulacoes/aluguel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imovelId: imovelCriado.id,
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
        }

        setMensagemBanco(`✅ Sucesso! Imóvel e Financiamento salvos no banco com ID: ${imovelCriado.id}`);
      } else {
        setMensagemBanco("❌ Erro ao salvar dados no banco. Verifique os valores preenchidos.");
      }
    } catch (e) {
      setMensagemBanco("❌ Falha de conexão ao salvar no banco de dados.");
    } finally {
      setSalvandoBanco(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header onNovaAnalise={handleNovaAnalise} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Formulário de Entrada com CEP Automático & Salvamento no Banco */}
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

        {/* Dashboard de Comparação e Donut Chart */}
        {resultado && (dadosImovel.valorCompra > 0 || dadosFinanciamento.valorFinanciado > 0) && (
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
            © {new Date().getFullYear()} Sistema de Análise Financeira de Venda vs. Aluguel de Imóveis Financiados.
          </p>
        </div>
      </footer>
    </div>
  );
};
