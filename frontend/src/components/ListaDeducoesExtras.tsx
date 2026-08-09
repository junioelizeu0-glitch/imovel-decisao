import React, { useState } from "react";
import { Plus, Trash2, Tag, Percent, DollarSign, Check, X } from "lucide-react";
import { TaxaExtra } from "../types";
import { formatCurrencyBRL, parseCurrencyBRL } from "../utils/formatters";

interface ListaDeducoesExtrasProps {
  taxasExtras: TaxaExtra[];
  onAdicionarTaxa: (novaTaxa: TaxaExtra) => void;
  onRemoverTaxa: (id: string) => void;
  valorVendaBase: number;
}

export const ListaDeducoesExtras: React.FC<ListaDeducoesExtrasProps> = ({
  taxasExtras,
  onAdicionarTaxa,
  onRemoverTaxa,
  valorVendaBase,
}) => {
  const [exibindoFormulario, setExibindoFormulario] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<"FIXO" | "PERCENTUAL">("FIXO");
  const [textoValor, setTextoValor] = useState("");

  const handleSalvarNovaTaxa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim()) return;

    const valorNum = tipo === "FIXO" ? parseCurrencyBRL(textoValor) : Number(textoValor.replace(",", "."));
    if (isNaN(valorNum) || valorNum <= 0) return;

    const novaTaxa: TaxaExtra = {
      id: "taxa_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5),
      descricao: descricao.trim(),
      tipo,
      valor: valorNum,
    };

    onAdicionarTaxa(novaTaxa);
    setDescricao("");
    setTextoValor("");
    setExibindoFormulario(false);
  };

  const calcularValorRealTaxa = (taxa: TaxaExtra): number => {
    if (taxa.tipo === "PERCENTUAL") {
      return (taxa.valor / 100) * valorVendaBase;
    }
    return taxa.valor;
  };

  return (
    <div className="space-y-3 pt-2 border-t border-slate-100">
      {/* Lista de Taxas Extras Adicionadas */}
      {taxasExtras.length > 0 && (
        <div className="space-y-2">
          {taxasExtras.map((taxa) => {
            const valorCalculado = calcularValorRealTaxa(taxa);
            return (
              <div
                key={taxa.id}
                className="flex items-center justify-between py-1.5 px-3 bg-rose-50/60 rounded-xl border border-rose-100 text-xs text-rose-700 font-medium group transition"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-rose-500" />
                  <span>
                    (-) {taxa.descricao}{" "}
                    {taxa.tipo === "PERCENTUAL" && (
                      <span className="text-[10px] text-rose-400">({taxa.valor}%)</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    -R$ {valorCalculado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoverTaxa(taxa.id)}
                    title="Remover taxa"
                    className="text-rose-400 hover:text-rose-600 transition p-1 rounded-md hover:bg-rose-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Botão para Exibir o Formulário ou Formulário Embutido */}
      {!exibindoFormulario ? (
        <button
          type="button"
          onClick={() => setExibindoFormulario(true)}
          className="text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100/80 px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-teal-200/60 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-teal-600" />
          Adicionar Taxa/Imposto Extra
        </button>
      ) : (
        <form
          onSubmit={handleSalvarNovaTaxa}
          className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3 animate-fadeIn text-xs"
        >
          <div className="flex items-center justify-between font-bold text-slate-800">
            <span>Nova Taxa / Imposto Extra</span>
            <button
              type="button"
              onClick={() => setExibindoFormulario(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Descrição */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Nome / Descrição
              </label>
              <input
                type="text"
                required
                placeholder="Ex: ITBI residual, Taxa quitação"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Tipo
              </label>
              <div className="flex rounded-lg overflow-hidden border border-slate-300 bg-white">
                <button
                  type="button"
                  onClick={() => setTipo("FIXO")}
                  className={`flex-1 py-1 text-[11px] font-bold flex items-center justify-center gap-0.5 ${
                    tipo === "FIXO" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <DollarSign className="w-3 h-3" /> R$
                </button>
                <button
                  type="button"
                  onClick={() => setTipo("PERCENTUAL")}
                  className={`flex-1 py-1 text-[11px] font-bold flex items-center justify-center gap-0.5 ${
                    tipo === "PERCENTUAL" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Percent className="w-3 h-3" /> %
                </button>
              </div>
            </div>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
              {tipo === "FIXO" ? "Valor em R$" : "Percentual (%) do Valor de Venda"}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder={tipo === "FIXO" ? "1.500,00" : "1.5"}
                value={textoValor}
                onChange={(e) => setTextoValor(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setExibindoFormulario(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" /> Adicionar Taxa
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
