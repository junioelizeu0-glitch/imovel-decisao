import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { calcularCenarioVenda } from "../services/regras-fiscais.js";
import { calcularFinanciamento } from "../services/calculo-financiamento.js";
import { calcularCenarioAluguel } from "../services/calculo-aluguel.js";

const prisma = new PrismaClient();

export async function simularVenda(req: Request, res: Response) {
  try {
    const {
      imovelId,
      valorVendaEstimado,
      percentualCorretagem = 6,
      valorCompra,
      custoAquisicaoExtra = 0,
      saldoDevedorAtual,
      anoCompra,
      isUnicoImovelAte440k = false,
      reinvestimento180Dias = false,
    } = req.body;

    const resultado = calcularCenarioVenda({
      valorVenda: Number(valorVendaEstimado),
      valorCompra: Number(valorCompra),
      custoAquisicaoExtra: Number(custoAquisicaoExtra),
      saldoDevedorAtual: Number(saldoDevedorAtual),
      percentualCorretagem: Number(percentualCorretagem),
      anoCompra: Number(anoCompra || new Date().getFullYear()),
      isUnicoImovelAte440k: Boolean(isUnicoImovelAte440k),
      reinvestimento180Dias: Boolean(reinvestimento180Dias),
    });

    if (imovelId) {
      await prisma.simulacaoVenda.create({
        data: {
          imovel_id: imovelId,
          valor_venda_estimado: resultado.valorVenda,
          percentual_corretagem: Number(percentualCorretagem),
          resultado_liquido: resultado.resultadoLiquido,
          imposto_renda_calculado: resultado.impostoRendaCalculado,
          isento_ir: resultado.isentoIR,
          motivo_isencao: resultado.motivoIsencao || null,
        },
      });
    }

    return res.json(resultado);
  } catch (error: any) {
    return res.status(500).json({ error: "Erro ao simular venda", detalhe: error?.message });
  }
}

export async function simularAluguel(req: Request, res: Response) {
  try {
    const {
      imovelId,
      valorMercadoAtual,
      saldoDevedorAtual,
      taxaJurosFinanciamentoAnual,
      sistemaAmortizacao = "SAC",
      parcelasRestantes,
      valorParcelaAtual,
      valorAluguelMensal,
      custosMensaisExtras = 0,
      aliquotaIRAluguel,
      taxaValorizacaoAnualEstimada,
      // Dados para comparativo da venda
      valorCompra,
      custoAquisicaoExtra = 0,
      anoCompra = new Date().getFullYear(),
      percentualCorretagem = 6,
      isUnicoImovelAte440k = false,
      reinvestimento180Dias = false,
      taxaCDIAnualRef = 10.5,
    } = req.body;

    const resultado = calcularCenarioAluguel({
      valorMercadoAtual: Number(valorMercadoAtual),
      saldoDevedorAtual: Number(saldoDevedorAtual),
      taxaJurosFinanciamentoAnual: Number(taxaJurosFinanciamentoAnual),
      sistemaAmortizacao,
      parcelasRestantes: Number(parcelasRestantes),
      valorParcelaAtual: Number(valorParcelaAtual),
      valorAluguelMensal: Number(valorAluguelMensal),
      custosMensaisExtras: Number(custosMensaisExtras),
      aliquotaIRAluguel: aliquotaIRAluguel !== undefined ? Number(aliquotaIRAluguel) : undefined,
      taxaValorizacaoAnualEstimada: Number(taxaValorizacaoAnualEstimada),
      taxaCDIAnualRef: Number(taxaCDIAnualRef),
      parametrosVenda: {
        valorVenda: Number(valorMercadoAtual),
        valorCompra: Number(valorCompra),
        custoAquisicaoExtra: Number(custoAquisicaoExtra),
        saldoDevedorAtual: Number(saldoDevedorAtual),
        percentualCorretagem: Number(percentualCorretagem),
        anoCompra: Number(anoCompra),
        isUnicoImovelAte440k: Boolean(isUnicoImovelAte440k),
        reinvestimento180Dias: Boolean(reinvestimento180Dias),
      },
    });

    if (imovelId) {
      await prisma.simulacaoAluguel.create({
        data: {
          imovel_id: imovelId,
          valor_aluguel_mensal: Number(valorAluguelMensal),
          custos_mensais_extras: Number(custosMensaisExtras),
          aliquota_ir_aluguel: aliquotaIRAluguel !== undefined ? Number(aliquotaIRAluguel) : 0,
          taxa_valorizacao_anual_estimada: Number(taxaValorizacaoAnualEstimada),
          meses_ate_quitar: resultado.mesesAteQuitar,
          valor_imovel_projetado: resultado.valorImovelProjetado,
        },
      });
    }

    return res.json(resultado);
  } catch (error: any) {
    return res.status(500).json({ error: "Erro ao simular aluguel", detalhe: error?.message });
  }
}

export async function recalcularFinanciamento(req: Request, res: Response) {
  try {
    const {
      valorFinanciado,
      taxaJurosAnual,
      sistemaAmortizacao = "SAC",
      numeroParcelasTotal,
      parcelasPagas,
      saldoDevedorManual,
    } = req.body;

    const resultado = calcularFinanciamento({
      valorFinanciado: Number(valorFinanciado),
      taxaJurosAnual: Number(taxaJurosAnual),
      sistemaAmortizacao,
      numeroParcelasTotal: Number(numeroParcelasTotal),
      parcelasPagas: Number(parcelasPagas),
      saldoDevedorManual: saldoDevedorManual ? Number(saldoDevedorManual) : undefined,
    });

    return res.json(resultado);
  } catch (error: any) {
    return res.status(500).json({ error: "Erro ao recalcular financiamento", detalhe: error?.message });
  }
}
