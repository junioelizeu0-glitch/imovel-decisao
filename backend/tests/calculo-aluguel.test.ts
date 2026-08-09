import { describe, it, expect } from "vitest";
import { calcularCenarioAluguel } from "../src/services/calculo-aluguel.js";

describe("Módulo de Simulação de Aluguel e Comparativo com Venda", () => {
  it("deve sinalizar fluxo de caixa negativo quando o aluguel líquido for menor que a parcela", () => {
    const res = calcularCenarioAluguel({
      valorMercadoAtual: 500000,
      saldoDevedorAtual: 300000,
      taxaJurosFinanciamentoAnual: 10,
      sistemaAmortizacao: "SAC",
      parcelasRestantes: 300,
      valorParcelaAtual: 3500, // Parcela alta
      valorAluguelMensal: 2000, // Aluguel baixo
      custosMensaisExtras: 200,
      taxaValorizacaoAnualEstimada: 6,
      taxaCDIAnualRef: 10.5,
      parametrosVenda: {
        valorVenda: 500000,
        valorCompra: 350000,
        saldoDevedorAtual: 300000,
        anoCompra: 2019,
      },
    });

    expect(res.fluxoNegativo).toBe(true);
    expect(res.alertaRisco).toBeDefined();
    expect(res.alertaRisco).toContain("não cobre a parcela do financiamento");
  });

  it("deve simular quitação acelerada quando o fluxo de caixa for positivo", () => {
    const res = calcularCenarioAluguel({
      valorMercadoAtual: 600000,
      saldoDevedorAtual: 200000,
      taxaJurosFinanciamentoAnual: 8.5,
      sistemaAmortizacao: "SAC",
      parcelasRestantes: 240,
      valorParcelaAtual: 1800,
      valorAluguelMensal: 3500, // Aluguel alto
      custosMensaisExtras: 300,
      taxaValorizacaoAnualEstimada: 7,
      taxaCDIAnualRef: 10.5,
      parametrosVenda: {
        valorVenda: 600000,
        valorCompra: 400000,
        saldoDevedorAtual: 200000,
        anoCompra: 2020,
      },
    });

    expect(res.fluxoNegativo).toBe(false);
    expect(res.fluxoCaixaMensalLiquido).toBeGreaterThan(0);
    // Deve quitar em menos parcelas do que o total de 240
    expect(res.mesesAteQuitar).toBeLessThan(240);
    expect(res.patrimonioFinalAlugando).toBeGreaterThan(600000);
  });
});
