/**
 * Formata um valor de CEP para XXXXX-XXX
 */
export function formatCEP(value: string): string {
  const digits = (value || "").replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

/**
 * Converte número para string formatada de moeda em Reais (pt-BR): Ex 350000 -> "350.000,00"
 */
export function formatCurrencyBRL(val: number): string {
  if (!val || isNaN(val) || val === 0) return "";
  return val.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Converte string digitada pelo usuário (ex: "350.000,00" ou "350000") para número float puro
 */
export function parseCurrencyBRL(input: string): number {
  if (!input) return 0;
  // Se contiver vírgula ou ponto formatado
  const cleaned = input.trim();
  if (!cleaned) return 0;

  // Tratar formato brasileiro: milhar com ponto, decimal com vírgula
  if (cleaned.includes(",")) {
    const semPontos = cleaned.replace(/\./g, "");
    const comPontoDecimal = semPontos.replace(",", ".");
    const val = parseFloat(comPontoDecimal);
    return isNaN(val) ? 0 : val;
  }

  // Se o usuário digitou apenas números sem pontuação (ex: "350000")
  const val = parseFloat(cleaned.replace(/\D/g, ""));
  return isNaN(val) ? 0 : val;
}
