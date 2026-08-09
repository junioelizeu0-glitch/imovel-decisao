export type SistemaAmortizacao = "SAC" | "PRICE";

export interface ParametrosFinanciamento {
  valorFinanciado: number;
  taxaJurosAnual: number; // Porcentagem (ex: 9.5 para 9.5% a.a.)
  sistemaAmortizacao: SistemaAmortizacao;
  numeroParcelasTotal: number;
  parcelasPagas: number;
  saldoDevedorManual?: number;
}

export interface DetalheFinanciamento {
  valorFinanciado: number;
  taxaJurosMensal: number;
  sistemaAmortizacao: SistemaAmortizacao;
  numeroParcelasTotal: number;
  parcelasPagas: number;
  parcelasRestantes: number;
  saldoDevedorCalculado: number;
  saldoDevedorAtual: number; // Saldo devedor final (manual se informado, senão calculado)
  valorParcelaAtual: number;
}

/**
 * Converte taxa anual em taxa mensal efetiva: i_mensal = (1 + i_anual)^(1/12) - 1
 */
export function converterTaxaAnualParaMensal(taxaAnualPercent: number): number {
  const taxaAnualDecimal = taxaAnualPercent / 100;
  return Math.pow(1 + taxaAnualDecimal, 1 / 12) - 1;
}

/**
 * Calcula o saldo devedor e valor da parcela atual para SAC ou PRICE
 */
export function calcularFinanciamento(params: ParametrosFinanciamento): DetalheFinanciamento {
  const {
    valorFinanciado,
    taxaJurosAnual,
    sistemaAmortizacao,
    numeroParcelasTotal,
    parcelasPagas,
    saldoDevedorManual,
  } = params;

  const i = converterTaxaAnualParaMensal(taxaJurosAnual);
  const parcelasRestantes = Math.max(0, numeroParcelasTotal - parcelasPagas);

  let saldoDevedorCalculado = 0;
  let valorParcelaAtual = 0;

  if (sistemaAmortizacao === "SAC") {
    const amortizacaoConstante = valorFinanciado / numeroParcelasTotal;
    saldoDevedorCalculado = Math.max(0, valorFinanciado - parcelasPagas * amortizacaoConstante);

    // Próxima parcela (mês parcelasPagas + 1)
    const jurosProximaParcela = saldoDevedorCalculado * i;
    valorParcelaAtual = amortizacaoConstante + jurosProximaParcela;
  } else {
    // PRICE
    if (i > 0) {
      const fator = Math.pow(1 + i, numeroParcelasTotal);
      const parcelaFixa = valorFinanciado * ((i * fator) / (fator - 1));

      // Saldo devedor após K parcelas pagas
      const fatorP = Math.pow(1 + i, parcelasPagas);
      saldoDevedorCalculado = Math.max(
        0,
        valorFinanciado * fatorP - parcelaFixa * ((fatorP - 1) / i)
      );

      valorParcelaAtual = parcelaFixa;
    } else {
      const parcelaFixa = valorFinanciado / numeroParcelasTotal;
      saldoDevedorCalculado = Math.max(0, valorFinanciado - parcelasPagas * parcelaFixa);
      valorParcelaAtual = parcelaFixa;
    }
  }

  const saldoDevedorAtual =
    saldoDevedorManual !== undefined && saldoDevedorManual > 0
      ? saldoDevedorManual
      : saldoDevedorCalculado;

  return {
    valorFinanciado,
    taxaJurosMensal: i * 100,
    sistemaAmortizacao,
    numeroParcelasTotal,
    parcelasPagas,
    parcelasRestantes,
    saldoDevedorCalculado,
    saldoDevedorAtual,
    valorParcelaAtual,
  };
}
