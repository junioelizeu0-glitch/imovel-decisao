export interface ParametrosVenda {
  valorVenda: number;
  valorCompra: number;
  custoAquisicaoExtra?: number;
  saldoDevedorAtual: number;
  percentualCorretagem?: number; // Ex: 6 para 6%
  anoCompra: number;
  isUnicoImovelAte440k?: boolean;
  reinvestimento180Dias?: boolean;
}

export interface ResultadoVenda {
  valorVenda: number;
  ganhoDeCapitalBruto: number;
  fatorReducaoAno: number; // 0 a 1
  ganhoDeCapitalTributavel: number;
  impostoRendaCalculado: number;
  aliquotaEfetiva: number;
  isentoIR: boolean;
  motivoIsencao?: string;
  valorCorretagem: number;
  saldoDevedorAbatido: number;
  resultadoLiquido: number;
}

/**
  Tabela de fatores de redução para imóveis comprados entre 1970 e 1988 (Lei 7.713/88, Art. 18)
 */
export function getFatorReducaoAnoCompra(anoCompra: number): number {
  if (anoCompra <= 1969) return 1.0; // 100% de redução (isento)
  const fatores: Record<number, number> = {
    1970: 0.95,
    1971: 0.90,
    1972: 0.85,
    1973: 0.80,
    1974: 0.75,
    1975: 0.70,
    1976: 0.65,
    1977: 0.60,
    1978: 0.55,
    1979: 0.50,
    1980: 0.45,
    1981: 0.40,
    1982: 0.35,
    1983: 0.30,
    1984: 0.25,
    1985: 0.20,
    1986: 0.15,
    1987: 0.10,
    1988: 0.05,
  };
  return fatores[anoCompra] || 0.0;
}

/**
 * Alíquota progressiva do IR sobre ganho de capital (Lei 13.259/2016)
 */
export function calcularIRProgressivo(ganhoTributavel: number): number {
  if (ganhoTributavel <= 0) return 0;

  const FAIXA_1 = 5_000_000;
  const FAIXA_2 = 10_000_000;
  const FAIXA_3 = 30_000_000;

  let imposto = 0;

  if (ganhoTributavel <= FAIXA_1) {
    imposto = ganhoTributavel * 0.15;
  } else if (ganhoTributavel <= FAIXA_2) {
    imposto = FAIXA_1 * 0.15 + (ganhoTributavel - FAIXA_1) * 0.175;
  } else if (ganhoTributavel <= FAIXA_3) {
    imposto = FAIXA_1 * 0.15 + (FAIXA_2 - FAIXA_1) * 0.175 + (ganhoTributavel - FAIXA_2) * 0.20;
  } else {
    imposto =
      FAIXA_1 * 0.15 +
      (FAIXA_2 - FAIXA_1) * 0.175 +
      (FAIXA_3 - FAIXA_2) * 0.20 +
      (ganhoTributavel - FAIXA_3) * 0.225;
  }

  return imposto;
}

/**
 * Calcula o resultado completo do cenário "Vender Agora"
 */
export function calcularCenarioVenda(params: ParametrosVenda): ResultadoVenda {
  const {
    valorVenda,
    valorCompra,
    custoAquisicaoExtra = 0,
    saldoDevedorAtual,
    percentualCorretagem = 6,
    anoCompra,
    isUnicoImovelAte440k = false,
    reinvestimento180Dias = false,
  } = params;

  const custoTotalCompra = valorCompra + custoAquisicaoExtra;
  const ganhoBruto = Math.max(0, valorVenda - custoTotalCompra);

  // Verificação de Isenção
  let isento = false;
  let motivoIsencao: string | undefined = undefined;

  if (valorVenda <= 35000) {
    isento = true;
    motivoIsencao = "Isenção para vendas de bens de pequeno valor (≤ R$ 35.000,00)";
  } else if (isUnicoImovelAte440k && valorVenda <= 440000) {
    isento = true;
    motivoIsencao = "Isenção para único imóvel residencial vendido por até R$ 440.000,00";
  } else if (reinvestimento180Dias) {
    isento = true;
    motivoIsencao = "Isenção por reinvestimento em outro imóvel residencial no Brasil em 180 dias";
  } else if (anoCompra <= 1969) {
    isento = true;
    motivoIsencao = "Isenção total por aquisição anterior ou igual a 1969 (Lei 7.713/88)";
  }

  // Fator de redução por ano de compra (1970 a 1988)
  const fatorReducao = getFatorReducaoAnoCompra(anoCompra);
  const ganhoTributavel = isento ? 0 : Math.max(0, ganhoBruto * (1 - fatorReducao));

  const impostoCalculado = isento ? 0 : calcularIRProgressivo(ganhoTributavel);
  const aliquotaEfetiva = ganhoBruto > 0 ? (impostoCalculado / ganhoBruto) * 100 : 0;

  const valorCorretagem = valorVenda * (percentualCorretagem / 100);

  // Resultado líquido da venda após quitação da dívida, comissão de corretagem e IR
  const resultadoLiquido = valorVenda - saldoDevedorAtual - impostoCalculado - valorCorretagem;

  return {
    valorVenda,
    ganhoDeCapitalBruto: ganhoBruto,
    fatorReducaoAno: fatorReducao,
    ganhoDeCapitalTributavel: ganhoTributavel,
    impostoRendaCalculado: impostoCalculado,
    aliquotaEfetiva,
    isentoIR: isento,
    motivoIsencao,
    valorCorretagem,
    saldoDevedorAbatido: saldoDevedorAtual,
    resultadoLiquido,
  };
}
