import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { calcularFinanciamento } from "../services/calculo-financiamento.js";
import { buscarValorizacaoPorEndereco } from "../services/busca-valorizacao.js";

const prisma = new PrismaClient();

export async function criarImovelComFinanciamento(req: Request, res: Response) {
  try {
    const {
      endereco,
      cidade,
      estado,
      cep,
      valor_compra,
      data_compra,
      custo_aquisicao_extra = 0,
      valor_mercado_atual,
      // Financiamento
      banco,
      valor_financiado,
      taxa_juros_anual,
      sistema_amortizacao,
      numero_parcelas_total,
      parcelas_pagas,
      saldo_devedor_manual,
    } = req.body;

    if (!endereco || !cidade || !estado || !cep || !valor_compra || !valor_financiado) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes" });
    }

    const calculoFin = calcularFinanciamento({
      valorFinanciado: Number(valor_financiado),
      taxaJurosAnual: Number(taxa_juros_anual),
      sistemaAmortizacao: sistema_amortizacao || "SAC",
      numeroParcelasTotal: Number(numero_parcelas_total),
      parcelasPagas: Number(parcelas_pagas),
      saldoDevedorManual: saldo_devedor_manual ? Number(saldo_devedor_manual) : undefined,
    });

    const novoImovel = await prisma.imovel.create({
      data: {
        endereco,
        cidade,
        estado,
        cep,
        valor_compra: Number(valor_compra),
        data_compra: new Date(data_compra || Date.now()),
        custo_aquisicao_extra: Number(custo_aquisicao_extra),
        valor_mercado_atual: valor_mercado_atual ? Number(valor_mercado_atual) : Number(valor_compra),
        financiamentos: {
          create: {
            banco: banco || "Caixa Econômica Federal",
            valor_financiado: Number(valor_financiado),
            taxa_juros_anual: Number(taxa_juros_anual),
            sistema_amortizacao: sistema_amortizacao || "SAC",
            numero_parcelas_total: Number(numero_parcelas_total),
            parcelas_pagas: Number(parcelas_pagas),
            valor_parcela_atual: calculoFin.valorParcelaAtual,
            saldo_devedor_atual: calculoFin.saldoDevedorAtual,
          },
        },
      },
      include: {
        financiamentos: true,
      },
    });

    return res.status(201).json(novoImovel);
  } catch (error: any) {
    console.error("Erro ao criar imóvel:", error);
    return res.status(500).json({ error: "Erro interno ao salvar imóvel", detalhe: error?.message });
  }
}

export async function listarImoveis(req: Request, res: Response) {
  try {
    const imoveis = await prisma.imovel.findMany({
      include: {
        financiamentos: true,
        simulacoes_venda: { orderBy: { data_simulacao: "desc" }, take: 1 },
        simulacoes_aluguel: { orderBy: { data_simulacao: "desc" }, take: 1 },
      },
      orderBy: { criado_em: "desc" },
    });
    return res.json(imoveis);
  } catch (error: any) {
    return res.status(500).json({ error: "Erro ao listar imóveis", detalhe: error?.message });
  }
}

export async function buscarValorizacaoEndereco(req: Request, res: Response) {
  try {
    const { endereco, cidade, estado } = req.query;
    if (!endereco) {
      return res.status(400).json({ error: "Parâmetro 'endereco' é obrigatório" });
    }

    const resultado = await buscarValorizacaoPorEndereco(
      String(endereco),
      cidade ? String(cidade) : undefined,
      estado ? String(estado) : undefined
    );

    return res.json(resultado);
  } catch (error: any) {
    return res.status(500).json({ error: "Erro ao buscar valorização por endereço", detalhe: error?.message });
  }
}
