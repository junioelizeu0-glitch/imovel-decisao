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
      valor_compra = 0,
      data_compra,
      custo_aquisicao_extra = 0,
      valor_mercado_atual,
      // Financiamento
      banco,
      valor_financiado = 0,
      taxa_juros_anual = 0,
      sistema_amortizacao = "SAC",
      numero_parcelas_total = 360,
      parcelas_pagas = 0,
      saldo_devedor_manual,
    } = req.body;

    if (!endereco || !cidade || !cep) {
      return res.status(400).json({ error: "Preencha o CEP, Endereço e Cidade do imóvel antes de salvar." });
    }

    const valorCompraNum = Number(valor_compra) || 0;
    const valorFinanciadoNum = Number(valor_financiado) || 0;
    const taxaJurosNum = Number(taxa_juros_anual) || 0;
    const numeroParcelasNum = Number(numero_parcelas_total) || 360;
    const parcelasPagasNum = Number(parcelas_pagas) || 0;

    const calculoFin = calcularFinanciamento({
      valorFinanciado: valorFinanciadoNum,
      taxaJurosAnual: taxaJurosNum,
      sistemaAmortizacao: sistema_amortizacao || "SAC",
      numeroParcelasTotal: numeroParcelasNum,
      parcelasPagas: parcelasPagasNum,
      saldoDevedorManual: saldo_devedor_manual ? Number(saldo_devedor_manual) : undefined,
    });

    const dataCompraValida =
      data_compra && !isNaN(Date.parse(data_compra)) ? new Date(data_compra) : new Date();

    const novoImovel = await prisma.imovel.create({
      data: {
        endereco: String(endereco),
        cidade: String(cidade),
        estado: String(estado || "UF"),
        cep: String(cep),
        valor_compra: valorCompraNum,
        data_compra: dataCompraValida,
        custo_aquisicao_extra: Number(custo_aquisicao_extra) || 0,
        valor_mercado_atual: valor_mercado_atual ? Number(valor_mercado_atual) : valorCompraNum,
        financiamentos: {
          create: {
            banco: banco || "Caixa Econômica Federal",
            valor_financiado: valorFinanciadoNum,
            taxa_juros_anual: taxaJurosNum,
            sistema_amortizacao: sistema_amortizacao || "SAC",
            numero_parcelas_total: numeroParcelasNum,
            parcelas_pagas: parcelasPagasNum,
            valor_parcela_atual: calculoFin.valorParcelaAtual || 0,
            saldo_devedor_atual: calculoFin.saldoDevedorAtual || 0,
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
