import { converterTaxaAnualParaMensal, SistemaAmortizacao } from "./calculo-financiamento.js";
import { calcularCenarioVenda, ParametrosVenda, ResultadoVenda } from "./regras-fiscais.js";

export interface ParametrosAluguel {
  valorMercadoAtual: number;
  saldoDevedorAtual: number;
  taxaJurosFinanciamentoAnual: number;
  sistemaAmortizacao: SistemaAmortizacao;
  parcelasRestantes: number;
  valorParcelaAtual: number;

  valorAluguelMensal: number;
  custosMensaisExtras?: number;
  aliquotaIRAluguel?: number;
  taxaValorizacaoAnualEstimada: number;

  parametrosVenda: ParametrosVenda;
  taxaCDIAnualRef?: number;
}

export interface PontoEvolucaoMensal {
  mes: number;
  saldoDevedor: number;
  valorImovelProjetado: number;
  patrimonioAcumulado: number;
  fluxoCaixaMensal: number;
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

  evolucaoMensal: PontoEvolucaoMensal[];

  // Comparativo Venda
  resultadoVendaAgora: ResultadoVenda;
  patrimonioFinalVendaInvestido: number;
  diferencaPatrimonial: number;
  opcaoRecomendada: "VENDER" | "ALUGAR";
  resumoComparativo: string;
}

export function calcularIRAluguelMensal(valorAluguelBruto: number, aliquotaCustom?: number): number {
  if (aliquotaCustom !== undefined && aliquotaCustom >= 0) {
    return valorAluguelBruto * (aliquotaCustom / 100);
  }

  if (valorAluguelBruto <= 2259.2) return 0;
  if (valorAluguelBruto <= 2826.65) return valorAluguelBruto * 0.075 - 169.44;
  if (valorAluguelBruto <= 3751.05) return valorAluguelBruto * 0.15 - 381.44;
  if (valorAluguelBruto <= 4664.68) return valorAluguelBruto * 0.225 - 662.77;
  return valorAluguelBruto * 0.275 - 896.0;
}

export function simularAmortizacaoAluguel(
  saldoDevedorInicial: number,
  taxaFinanciamentoAnual: number,
  sistemaAmortizacao: SistemaAmortizacao,
  parcelasRestantesMax: number,
  parcelaAtualBase: number,
  fluxoCaixaMensalLiquido: number,
  valorMercadoAtual: number,
  taxaValorizacaoAnual: number
): { mesesAteQuitar: number; acumuloFluxoCaixa: number; evolucaoMensal: PontoEvolucaoMensal[] } {
  const i = converterTaxaAnualParaMensal(taxaFinanciamentoAnual);
  let saldo = saldoDevedorInicial;
  let meses = 0;
  let acumuloFluxo = 0;
  const evolucaoMensal: PontoEvolucaoMensal[] = [];

  const amortizacaoConstanteSAC =
    sistemaAmortizacao === "SAC" ? saldoDevedorInicial / Math.max(1, parcelasRestantesMax) : 0;

  const maxMesesLimite = Math.max(600, parcelasRestantesMax * 2);

  // Incluir Ponto Inicial (Mês 0)
  evolucaoMensal.push({
    mes: 0,
    saldoDevedor: Math.round(saldoDevedorInicial),
    valorImovelProjetado: Math.round(valorMercadoAtual),
    patrimonioAcumulado: Math.round(valorMercadoAtual - saldoDevedorInicial),
    fluxoCaixaMensal: Math.round(fluxoCaixaMensalLiquido),
  });

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
    } else {
      acumuloFluxo += fluxoCaixaMensalLiquido;
    }

    const totalAmortizadoMes = amortizacaoRegular + amortizacaoExtra;
    saldo = Math.max(0, saldo - totalAmortizadoMes);

    // Projeção do imóvel no mês k
    const imovelProjetadoMes = valorMercadoAtual * Math.pow(1 + taxaValorizacaoAnual / 100, meses / 12);
    const patrimonioMes = imovelProjetadoMes - saldo + acumuloFluxo;

    // Amostrar pontos para o gráfico (todos os meses para prazos < 60, ou a cada N meses)
    const passoAmostragem = Math.max(1, Math.floor(parcelasRestantesMax / 40));
    if (meses % passoAmostragem === 0 || saldo <= 0.01) {
      evolucaoMensal.push({
        mes: meses,
        saldoDevedor: Math.round(saldo),
        valorImovelProjetado: Math.round(imovelProjetadoMes),
        patrimonioAcumulado: Math.round(patrimonioMes),
        fluxoCaixaMensal: Math.round(fluxoCaixaMensalLiquido),
      });
    }

    if (saldo <= 0.01) break;
  }

  return {
    mesesAteQuitar: meses,
    acumuloFluxoCaixa: acumuloFluxo,
    evolucaoMensal,
  };
}

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

  const { mesesAteQuitar, acumuloFluxoCaixa, evolucaoMensal } = simularAmortizacaoAluguel(
    saldoDevedorAtual,
    taxaJurosFinanciamentoAnual,
    sistemaAmortizacao,
    parcelasRestantes,
    valorParcelaAtual,
    fluxoCaixaMensalLiquido,
    valorMercadoAtual,
    taxaValorizacaoAnualEstimada
  );

  const anosAteQuitar = Number((mesesAteQuitar / 12).toFixed(1));

  const fatorValorizacao = Math.pow(1 + taxaValorizacaoAnualEstimada / 100, mesesAteQuitar / 12);
  const valorImovelProjetado = valorMercadoAtual * fatorValorizacao;
  const patrimonioFinalAlugando = valorImovelProjetado + acumuloFluxoCaixa;

  const resultadoVendaAgora = calcularCenarioVenda(parametrosVenda);
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
    evolucaoMensal,
    resultadoVendaAgora,
    patrimonioFinalVendaInvestido,
    diferencaPatrimonial,
    opcaoRecomendada,
    resumoComparativo,
  };
}
