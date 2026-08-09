import { describe, it, expect } from "vitest";
import { calcularFinanciamento } from "../src/services/calculo-financiamento.js";

describe("Módulo de Cálculo de Financiamento (SAC vs PRICE)", () => {
  it("deve calcular saldo devedor e parcelas corretamente no sistema SAC", () => {
    const res = calcularFinanciamento({
      valorFinanciado: 360000,
      taxaJurosAnual: 10,
      sistemaAmortizacao: "SAC",
      numeroParcelasTotal: 360,
      parcelasPagas: 60,
    });

    // Amortização mensal constante = 360.000 / 360 = 1.000
    // Saldo devedor após 60 parcelas = 360.000 - (60 * 1.000) = 300.000
    expect(res.saldoDevedorCalculado).toBe(300000);
    expect(res.parcelasRestantes).toBe(300);
    expect(res.valorParcelaAtual).toBeGreaterThan(1000);
  });

  it("deve calcular parcela fixa e saldo devedor no sistema PRICE", () => {
    const res = calcularFinanciamento({
      valorFinanciado: 200000,
      taxaJurosAnual: 12,
      sistemaAmortizacao: "PRICE",
      numeroParcelasTotal: 240,
      parcelasPagas: 24,
    });

    expect(res.valorParcelaAtual).toBeGreaterThan(0);
    expect(res.saldoDevedorCalculado).toBeLessThan(200000);
    expect(res.saldoDevedorCalculado).toBeGreaterThan(0);
  });

  it("deve permitir sobrescrever manualmente o saldo devedor", () => {
    const res = calcularFinanciamento({
      valorFinanciado: 500000,
      taxaJurosAnual: 9.5,
      sistemaAmortizacao: "SAC",
      numeroParcelasTotal: 360,
      parcelasPagas: 12,
      saldoDevedorManual: 450000,
    });

    expect(res.saldoDevedorAtual).toBe(450000);
  });
});
