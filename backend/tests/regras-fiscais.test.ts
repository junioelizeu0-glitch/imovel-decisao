import { describe, it, expect } from "vitest";
import {
  calcularCenarioVenda,
  calcularIRProgressivo,
  getFatorReducaoAnoCompra,
} from "../src/services/regras-fiscais.js";

describe("Módulo de Regras Fiscais e IR de Ganho de Capital", () => {
  it("deve aplicar isenção de IR para venda de valor até R$ 35.000", () => {
    const resultado = calcularCenarioVenda({
      valorVenda: 30000,
      valorCompra: 15000,
      saldoDevedorAtual: 0,
      anoCompra: 2020,
    });

    expect(resultado.isentoIR).toBe(true);
    expect(resultado.impostoRendaCalculado).toBe(0);
    expect(resultado.motivoIsencao).toContain("35.000");
  });

  it("deve aplicar isenção de IR para único imóvel de até R$ 440.000", () => {
    const resultado = calcularCenarioVenda({
      valorVenda: 420000,
      valorCompra: 250000,
      saldoDevedorAtual: 100000,
      anoCompra: 2021,
      isUnicoImovelAte440k: true,
    });

    expect(resultado.isentoIR).toBe(true);
    expect(resultado.impostoRendaCalculado).toBe(0);
    expect(resultado.motivoIsencao).toContain("440.000");
  });

  it("deve aplicar isenção para reinvestimento em outro imóvel residencial em 180 dias", () => {
    const resultado = calcularCenarioVenda({
      valorVenda: 800000,
      valorCompra: 500000,
      saldoDevedorAtual: 200000,
      anoCompra: 2018,
      reinvestimento180Dias: true,
    });

    expect(resultado.isentoIR).toBe(true);
    expect(resultado.impostoRendaCalculado).toBe(0);
    expect(resultado.motivoIsencao).toContain("180 dias");
  });

  it("deve calcular imposto de renda progressivo padrão de 15% sobre o ganho de capital", () => {
    const ganhoBruto = 200000;
    const ir = calcularIRProgressivo(ganhoBruto);
    expect(ir).toBe(30000); // 15% de 200.000
  });

  it("deve aplicar fator de redução para imóvel comprado em 1975", () => {
    const fator = getFatorReducaoAnoCompra(1975);
    expect(fator).toBe(0.7); // 70% de redução

    const resultado = calcularCenarioVenda({
      valorVenda: 1000000,
      valorCompra: 200000,
      saldoDevedorAtual: 0,
      anoCompra: 1975,
      percentualCorretagem: 0,
    });

    // Ganho bruto sem corretagem = 800.000. Ganho tributavel com 70% de redução = 800.000 * 0.3 = 240.000
    expect(resultado.ganhoDeCapitalTributavel).toBeCloseTo(240000);
    expect(resultado.impostoRendaCalculado).toBeCloseTo(36000); // 15% de 240.000
  });
});
