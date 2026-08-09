export interface ParametrosVenda {
  valorVenda: number;
  valorCompraOriginal: number;
  custoAquisicaoExtra?: number;
  anoCompra: number;
  anoVenda?: number;
  saldoDevedorAtual: number;
  percentualCorretagem?: number;
  isUnicoImovelAte440k?: boolean;
  reinvestimento180Dias?: boolean;
}

export interface ResultadoVenda {
  valorVenda: number;
  ganhoDeCapitalBruto: number;
  fatorReducaoAno: number;
  ganhoDeCapitalTributavel: number;
  impostoRendaCalculado: number;
  aliquotaEfetiva: number;
  isentoIR: boolean;
  motivoIsencao?: string;
  valorCorretagem: number;
  saldoDevedorAbatido: number;
  resultadoLiquido: number;
}

export function obterFatorReducaoLei11196(anoCompra: number, anoVenda: number = new Date().getFullYear()): number {
  if (anoCompra <= 1969) return 1.0;
  const tabelaReducao: { [ano: number]: number } = {
    1970: 0.95, 1971: 0.9, 1972: 0.85, 1973: 0.8, 1974: 0.75,
    1975: 0.7, 1976: 0.65, 1977: 0.6, 1978: 0.55, 1979: 0.5,
    1980: 0.45, 1981: 0.4, 1982: 0.35, 1983: 0.3, 1984: 0.25,
    1985: 0.2, 1986: 0.15, 1987: 0.1, 1988: 0.05,
  };
  return tabelaReducao[anoCompra] || 0.0;
}

export function calcularTabelaProgressivaGanhoCapital(ganhoTributavel: number): number {
  if (ganhoTributavel <= 0) return 0;
  const LIMITE_FAIXA_1 = 5_000_000;
  const LIMITE_FAIXA_2 = 10_000_000;
  const LIMITE_FAIXA_3 = 30_000_000;

  if (ganhoTributavel <= LIMITE_FAIXA_1) return ganhoTributavel * 0.15;
  if (ganhoTributavel <= LIMITE_FAIXA_2) return 5_000_000 * 0.15 + (ganhoTributavel - 5_000_000) * 0.175;
  if (ganhoTributavel <= LIMITE_FAIXA_3) return 5_000_000 * 0.15 + 5_000_000 * 0.175 + (ganhoTributavel - 10_000_000) * 0.2;
  return 5_000_000 * 0.15 + 5_000_000 * 0.175 + 20_000_000 * 0.2 + (ganhoTributavel - 30_000_000) * 0.225;
}

export function calcularCenarioVenda(params: ParametrosVenda): ResultadoVenda {
  const {
    valorVenda,
    valorCompraOriginal,
    custoAquisicaoExtra = 0,
    anoCompra,
    anoVenda = new Date().getFullYear(),
    saldoDevedorAtual,
    percentualCorretagem = 6,
    isUnicoImovelAte440k = false,
    reinvestimento180Dias = false,
  } = params;

  const custoTotalAquisicao = valorCompraOriginal + custoAquisicaoExtra;
  const valorCorretagem = valorVenda * (percentualCorretagem / 100);
  const ganhoDeCapitalBruto = Math.max(0, valorVenda - custoTotalAquisicao - valorCorretagem);

  let isentoIR = false;
  let motivoIsencao: string | undefined;

  if (ganhoDeCapitalBruto <= 0) {
    isentoIR = true;
    motivoIsencao = "Não houve ganho de capital com a venda.";
  } else if (valorVenda <= 35000) {
    isentoIR = true;
    motivoIsencao = "Venda de bem de pequeno valor (até R$ 35.000,00).";
  } else if (isUnicoImovelAte440k && valorVenda <= 440000) {
    isentoIR = true;
    motivoIsencao = "Isenção para único imóvel vendido por valor de até R$ 440.000,00.";
  } else if (reinvestimento180Dias) {
    isentoIR = true;
    motivoIsencao = "Isenção para reinvestimento do valor em outro imóvel residencial em 180 dias.";
  }

  const fatorReducaoAno = obterFatorReducaoLei11196(anoCompra, anoVenda);
  const ganhoDeCapitalTributavel = isentoIR ? 0 : ganhoDeCapitalBruto * (1 - fatorReducaoAno);
  const impostoRendaCalculado = isentoIR ? 0 : calcularTabelaProgressivaGanhoCapital(ganhoDeCapitalTributavel);
  const aliquotaEfetiva = ganhoDeCapitalBruto > 0 ? (impostoRendaCalculado / ganhoDeCapitalBruto) * 100 : 0;

  const saldoDevedorAbatido = Math.min(valorVenda, saldoDevedorAtual);
  const resultadoLiquido = valorVenda - saldoDevedorAbatido - impostoRendaCalculado - valorCorretagem;

  return {
    valorVenda,
    ganhoDeCapitalBruto,
    fatorReducaoAno,
    ganhoDeCapitalTributavel,
    impostoRendaCalculado: Number(impostoRendaCalculado.toFixed(2)),
    aliquotaEfetiva: Number(aliquotaEfetiva.toFixed(2)),
    isentoIR,
    motivoIsencao,
    valorCorretagem: Number(valorCorretagem.toFixed(2)),
    saldoDevedorAbatido: Number(saldoDevedorAbatido.toFixed(2)),
    resultadoLiquido: Number(resultadoLiquido.toFixed(2)),
  };
}
