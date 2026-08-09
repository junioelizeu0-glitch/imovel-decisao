import { Router } from "express";
import {
  criarImovelComFinanciamento,
  listarImoveis,
  buscarValorizacaoEndereco,
} from "../controllers/imovel.controller.js";
import {
  simularVenda,
  simularAluguel,
  recalcularFinanciamento,
} from "../controllers/simulacao.controller.js";

const router = Router();

// Imóveis
router.post("/imoveis", criarImovelComFinanciamento);
router.get("/imoveis", listarImoveis);
router.get("/valorizacao/buscar", buscarValorizacaoEndereco);

// Simulações
router.post("/simulacoes/venda", simularVenda);
router.post("/simulacoes/aluguel", simularAluguel);
router.post("/financiamento/recalcular", recalcularFinanciamento);

export default router;
