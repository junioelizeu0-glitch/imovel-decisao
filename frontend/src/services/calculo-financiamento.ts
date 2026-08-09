export type SistemaAmortizacao = "SAC" | "PRICE";

export interface ParametrosFinanciamento {
  valorFinanciado: number;
  taxaJurosAnual: number;
  sistemaAmortizacao: SistemaAmortizacao;
  numeroParcelasTotal: number;
  parcelasPagas: number;
  saldoDevedorManual?: number;
}

export interface ResultadoCalculoFinanciamento {
  saldoDevedorAtual: number;
  valorParcelaAtual: number;
  parcelasRestantes: number;
  totalJurosRestantes: number;
}

export function converterTaxaAnualParaMensal(taxaAnual: number): number {
  if (taxaAnual <= 0) return 0;
  return Math.pow(1 + taxaAnual / 100, 1 / 12) - 1;
}

export function calcularFinanciamento(
  params: ParametrosFinanciamento
): ResultadoCalculoFinanciamento {
  const {
    valorFinanciado,
    taxaJurosAnual,
    sistemaAmortizacao,
    numeroParcelasTotal,
    parcelasPagas,
    saldoDevedorManual,
  } = params;

  const parcelasRestantes = Math.max(0, numeroParcelasTotal - parcelasPagas);
  const i = converterTaxaAnualParaMensal(taxaJurosAnual);

  let saldoDevedorCalculado = 0;
  let valorParcelaAtual = 0;
  let totalJurosRestantes = 0;

  if (parcelasRestantes <= 0 || valorFinanciado <= 0) {
    return {
      saldoDevedorAtual: saldoDevedorManual ?? 0,
      valorParcelaAtual: 0,
      parcelasRestantes: 0,
      totalJurosRestantes: 0,
    };
  }

  if (sistemaAmortizacao === "SAC") {
    const amortizacaoMensalConstante = valorFinanciado / Math.max(1, numeroParcelasTotal);
    saldoDevedorCalculado = Math.max(
      0,
      valorFinanciado - amortizacaoMensalConstante * parcelasPagas
    );

    if (saldoDevedorManual !== undefined && saldoDevedorManual >= 0) {
      saldoDevedorCalculado = saldoDevedorManual;
    }

    const jurosProximaParcela = saldoDevedorCalculado * i;
    valorParcelaAtual = amortizacaoMensalConstante + jurosProximaParcela;

    let saldoTemp = saldoDevedorCalculado;
    for (let k = 0; k < parcelasRestantes; k++) {
      const jurosK = saldoTemp * i;
      totalJurosRestantes += jurosK;
      saldoTemp = Math.max(0, saldoTemp - amortizacaoMensalConstante);
    }
  } else {
    // Tabela PRICE
    if (i > 0) {
      const fator = Math.pow(1 + i, numeroParcelasTotal);
      const pmptInicial = valorFinanciado * ((i * fator) / (fator - 1));
      valorParcelaAtual = pmptInicial;

      const fatorPagas = Math.pow(1 + i, parcelasPagas);
      saldoDevedorCalculado =
        valorFinanciado * fatorPagas - (pmptInicial * (fatorPagas - 1)) / i;
      saldoDevedorCalculado = Math.max(0, saldoDevedorCalculado);
    } else {
      valorParcelaAtual = valorFinanciado / Math.max(1, numeroParcelasTotal);
      saldoDevedorCalculado = Math.max(0, valorFinanciado - valorParcelaAtual * parcelasPagas);
    }

    if (saldoDevedorManual !== undefined && saldoDevedorManual >= 0) {
      saldoDevedorCalculado = saldoDevedorManual;
      if (i > 0) {
        const fatorRestante = Math.pow(1 + i, parcelasRestantes);
        valorParcelaAtual = saldoDevedorCalculado * ((i * fatorRestante) / (fatorRestante - 1));
      } else {
        valorParcelaAtual = saldoDevedorCalculado / Math.max(1, parcelasRestantes);
      }
    }

    let saldoTemp = saldoDevedorCalculado;
    for (let k = 0; k < parcelasRestantes; k++) {
      const jurosK = saldoTemp * i;
      const amortizacaoK = Math.min(saldoTemp, valorParcelaAtual - jurosK);
      totalJurosRestantes += jurosK;
      saldoTemp = Math.max(0, saldoTemp - amortizacaoK);
    }
  }

  return {
    saldoDevedorAtual: Number(saldoDevedorCalculado.toFixed(2)),
    valorParcelaAtual: Number(valorParcelaAtual.toFixed(2)),
    parcelasRestantes,
    totalJurosRestantes: Number(totalJurosRestantes.toFixed(2)),
  };
}
