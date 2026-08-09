import { converterTaxaAnualParaMensal, SistemaAmortizacao } from "./calculo-financiamento.js";
import { calcularCenarioVenda, ParametrosVenda, ResultadoVenda } from "./regras-fiscais.js";

export interface ParametrosAluguel {
  // Imóvel e Financiamento
  valorMercadoAtual: number;
  saldoDevedorAtual: number;
  taxaJurosFinanciamentoAnual: number;
  sistemaAmortizacao: SistemaAmortizacao;
  parcelasRestantes: number;
  valorParcelaAtual: number;

  // Aluguel
  valorAluguelMensal: number;
  custosMensaisExtras?: number; // Condomínio, IPTU, taxa de administração
  aliquotaIRAluguel?: number; // Porcentagem (ex: 15 para 15% ou 0)
  taxaValorizacaoAnualEstimada: number; // Porcentagem (ex: 5.5 para 5.5% a.a.)

  // Parâmetros de Comparação com Venda
  parametrosVenda: ParametrosVenda;
  taxaCDIAnualRef?: number; // Porcentagem de rentabilidade de referência (default 10.5% a.a.)
}

export interface ResultadoAluguel {
  valorAluguelMensal: number;
  custosMensaisExtras: number;
  irAluguelMensal: number;
  fluxoCaixaMensalLiquido: number;
  fluxoNegativo: boolean;
  alertaRisco?: string;

  mesesAteQuitar: number;
  anosAteQuitar: number;
  valorImovelProjetado: number;
  acumuloFluxoCaixa: number;
  patrimonioFinalAlugando: number;

  // Comparativo Venda
  resultadoVendaAgora: ResultadoVenda;
  patrimonioFinalVendaInvestido: number;
  diferencaPatrimonial: number; // Alugando - Vendo
  opcaoRecomendada: "VENDER" | "ALUGAR";
  resumoComparativo: string;
}

/**
 * Calcula o imposto de renda mensal estimado sobre o aluguel (Tabela Progressiva IRPF simplificada)
 */
export function calcularIRAluguelMensal(valorAluguelBruto: number, aliquotaCustom?: number): number {
  if (aliquotaCustom !== undefined && aliquotaCustom >= 0) {
    return valorAluguelBruto * (aliquotaCustom / 100);
  }

  // Tabela Progressiva IRPF Mensal (2024/2025/2026)
  if (valorAluguelBruto <= 2259.2) return 0;
  if (valorAluguelBruto <= 2826.65) return valorAluguelBruto * 0.075 - 169.44;
  if (valorAluguelBruto <= 3751.05) return valorAluguelBruto * 0.15 - 381.44;
  if (valorAluguelBruto <= 4664.68) return valorAluguelBruto * 0.225 - 662.77;
  return valorAluguelBruto * 0.275 - 896.0;
}

/**
 * Simula a evolução da amortização com aplicação de fluxo mensal líquido positivo para aceleração
 */
export function simularAmortizacaoAluguel(
  saldoDevedorInicial: number,
  taxaFinanciamentoAnual: number,
  sistemaAmortizacao: SistemaAmortizacao,
  parcelasRestantesMax: number,
  parcelaAtualBase: number,
  fluxoCaixaMensalLiquido: number
): { mesesAteQuitar: number; acumuloFluxoCaixa: number } {
  const i = converterTaxaAnualParaMensal(taxaFinanciamentoAnual);
  let saldo = saldoDevedorInicial;
  let meses = 0;
  let acumuloFluxo = 0;

  const amortizacaoConstanteSAC =
    sistemaAmortizacao === "SAC" ? saldoDevedorInicial / Math.max(1, parcelasRestantesMax) : 0;

  const maxMesesLimite = Math.max(600, parcelasRestantesMax * 2);

  while (saldo > 0.01 && meses < maxMesesLimite) {
    meses++;
    const jurosMes = saldo * i;

    let parcelaMes = 0;
    let amortizacaoRegular = 0;

    if (sistemaAmortizacao === "SAC") {
      amortizacaoRegular = Math.min(saldo, amortizacaoConstanteSAC);
      parcelaMes = amortizacaoRegular + jurosMes;
    } else {
      parcelaMes = Math.min(saldo + jurosMes, parcelaAtualBase);
      amortizacaoRegular = Math.max(0, parcelaMes - jurosMes);
    }

    let amortizacaoExtra = 0;
    if (fluxoCaixaMensalLiquido > 0) {
      amortizacaoExtra = fluxoCaixaMensalLiquido;
      acumuloFluxo += 0; // O fluxo está sendo injetado para amortizar
    } else {
      // Fluxo negativo: usuário tem que tirar do bolso a diferença
      acumuloFluxo += fluxoCaixaMensalLiquido;
    }

    const totalAmortizadoMes = amortizacaoRegular + amortizacaoExtra;
    saldo = Math.max(0, saldo - totalAmortizadoMes);

    // Se quitou ou se excedeu prazo regular do contrato sem aceleração
    if (saldo <= 0.01) break;
  }

  return {
    mesesAteQuitar: meses,
    acumuloFluxoCaixa: acumuloFluxo,
  };
}

/**
 * Executa a simulação completa de Alugar e Amortizar vs. Vender Agora e Investir
 */
export function calcularCenarioAluguel(params: ParametrosAluguel): ResultadoAluguel {
  const {
    valorMercadoAtual,
    saldoDevedorAtual,
    taxaJurosFinanciamentoAnual,
    sistemaAmortizacao,
    parcelasRestantes,
    valorParcelaAtual,
    valorAluguelMensal,
    custosMensaisExtras = 0,
    aliquotaIRAluguel,
    taxaValorizacaoAnualEstimada,
    parametrosVenda,
    taxaCDIAnualRef = 10.5,
  } = params;

  const irAluguelMensal = Math.max(0, calcularIRAluguelMensal(valorAluguelMensal, aliquotaIRAluguel));
  const fluxoCaixaMensalLiquido =
    valorAluguelMensal - valorParcelaAtual - custosMensaisExtras - irAluguelMensal;

  const fluxoNegativo = fluxoCaixaMensalLiquido < 0;
  const alertaRisco = fluxoNegativo
    ? `Atenção: O aluguel líquido (R$ ${(valorAluguelMensal - irAluguelMensal - custosMensaisExtras).toFixed(2)}) não cobre a parcela do financiamento (R$ ${valorParcelaAtual.toFixed(2)}). Você precisará desembolsar R$ ${Math.abs(fluxoCaixaMensalLiquido).toFixed(2)} todos os meses!`
    : undefined;

  // Simulação de quitação e tempo
  const { mesesAteQuitar, acumuloFluxoCaixa } = simularAmortizacaoAluguel(
    saldoDevedorAtual,
    taxaJurosFinanciamentoAnual,
    sistemaAmortizacao,
    parcelasRestantes,
    valorParcelaAtual,
    fluxoCaixaMensalLiquido
  );

  const anosAteQuitar = Number((mesesAteQuitar / 12).toFixed(1));

  // Projeção do valor do imóvel com juros compostos de valorização
  const fatorValorizacao = Math.pow(1 + taxaValorizacaoAnualEstimada / 100, mesesAteQuitar / 12);
  const valorImovelProjetado = valorMercadoAtual * fatorValorizacao;

  // Patrimônio final alugando (Imóvel valorizado quitado + acúmulo de caixa)
  const patrimonioFinalAlugando = valorImovelProjetado + acumuloFluxoCaixa;

  // Cenário Venda Agora
  const resultadoVendaAgora = calcularCenarioVenda(parametrosVenda);

  // Projeção do líquido da venda investido a taxa CDI/Selic no mesmo prazo (mesesAteQuitar)
  const fatorInvestimentoCDI = Math.pow(1 + taxaCDIAnualRef / 100, mesesAteQuitar / 12);
  const patrimonioFinalVendaInvestido = Math.max(
    0,
    resultadoVendaAgora.resultadoLiquido * fatorInvestimentoCDI
  );

  const diferencaPatrimonial = patrimonioFinalAlugando - patrimonioFinalVendaInvestido;
  const opcaoRecomendada: "VENDER" | "ALUGAR" = diferencaPatrimonial >= 0 ? "ALUGAR" : "VENDER";

  const resumoComparativo =
    opcaoRecomendada === "ALUGAR"
      ? `Alugar compensa mais! Em ${mesesAteQuitar} meses (${anosAteQuitar} anos), seu patrimônio projetado alugando (R$ ${patrimonioFinalAlugando.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}) será R$ ${Math.abs(diferencaPatrimonial).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} superior ao cenário de venda imediata com investimento a ${taxaCDIAnualRef}% a.a.`
      : `Vender agora compensa mais! Investindo o saldo líquido de R$ ${resultadoVendaAgora.resultadoLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} a ${taxaCDIAnualRef}% a.a., seu patrimônio em ${mesesAteQuitar} meses será R$ ${Math.abs(diferencaPatrimonial).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} superior ao cenário de aluguel.`;

  return {
    valorAluguelMensal,
    custosMensaisExtras,
    irAluguelMensal,
    fluxoCaixaMensalLiquido,
    fluxoNegativo,
    alertaRisco,
    mesesAteQuitar,
    anosAteQuitar,
    valorImovelProjetado,
    acumuloFluxoCaixa,
    patrimonioFinalAlugando,
    resultadoVendaAgora,
    patrimonioFinalVendaInvestido,
    diferencaPatrimonial,
    opcaoRecomendada,
    resumoComparativo,
  };
}
