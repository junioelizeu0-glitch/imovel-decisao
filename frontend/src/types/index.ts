export interface TaxaExtra {
  id: string;
  descricao: string;
  tipo: "FIXO" | "PERCENTUAL";
  valor: number;
}

export interface DadosImovel {
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  valorCompra: number;
  dataCompra: string;
  custoAquisicaoExtra: number;
  valorMercadoAtual: number;
  anoCompra: number;
  isUnicoImovelAte440k: boolean;
  reinvestimento180Dias: boolean;
}

export interface DadosFinanciamento {
  banco: string;
  valorFinanciado: number;
  taxaJurosAnual: number;
  sistemaAmortizacao: "SAC" | "PRICE";
  numeroParcelasTotal: number;
  parcelasPagas: number;
  saldoDevedorAtual: number;
  saldoDevedorManual?: number;
  valorParcelaAtual: number;
}

export interface DadosSimulacaoAluguel {
  valorAluguelMensal: number;
  custosMensaisExtras: number;
  aliquotaIRAluguel: number;
  taxaValorizacaoAnualEstimada: number;
  taxaCDIAnualRef: number;
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
  valorCompraOriginal?: number;
  custoAquisicaoExtra?: number;
  anoCompra?: number;
  isUnicoImovelAte440k?: boolean;
  reinvestimento180Dias?: boolean;
  taxasExtras?: TaxaExtra[];
  totalTaxasExtras?: number;
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
  evolucaoMensal?: PontoEvolucaoMensal[];

  resultadoVendaAgora: ResultadoVenda;
  patrimonioFinalVendaInvestido: number;
  diferencaPatrimonial: number;
  opcaoRecomendada: "VENDER" | "ALUGAR";
  resumoComparativo: string;
}

export interface EstimativaValorizacao {
  enderecoConsultado: string;
  taxaValorizacaoAnualEstimada: number;
  faixaMinima: number;
  faixaMaxima: number;
  resumo: string;
  fontes: Array<{ titulo: string; url: string }>;
  cacheHit: boolean;
}
