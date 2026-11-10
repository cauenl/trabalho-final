"use client";

import { useEffect, useState, type FormEvent } from "react";

import { listarBairros } from "@/services/bairros";
import { FILTROS_INICIAIS, type FiltrosBusca } from "@/services/imoveis";
import type { Bairro } from "@/types/imovel";

const FINALIDADES = [
  { valor: "", rotulo: "Todas" },
  { valor: "VENDA", rotulo: "Venda" },
  { valor: "ALUGUEL", rotulo: "Aluguel" },
];

// Painel lateral de filtros (empilhado em telas pequenas).
export default function FiltrosVitrine({
  valor,
  onAplicar,
}: {
  valor: FiltrosBusca;
  onAplicar: (filtros: FiltrosBusca) => void;
}) {
  const [rascunho, setRascunho] = useState<FiltrosBusca>(valor);
  const [bairros, setBairros] = useState<Bairro[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    listarBairros()
      .then((lista) => {
        if (!cancelado) setBairros(lista);
      })
      .catch(() => {
        // sem bairros o filtro apenas fica vazio
      });
    return () => {
      cancelado = true;
    };
  }, []);

  function alterar<K extends keyof FiltrosBusca>(chave: K, v: FiltrosBusca[K]) {
    setRascunho((r) => ({ ...r, [chave]: v }));
  }

  function aplicar(e: FormEvent) {
    e.preventDefault();
    const min = rascunho.precoMin.trim();
    const max = rascunho.precoMax.trim();

    if ((min && (isNaN(Number(min)) || Number(min) < 0)) || (max && (isNaN(Number(max)) || Number(max) < 0))) {
      setErro("Informe valores numéricos válidos para o preço.");
      return;
    }
    if (min && max && Number(min) > Number(max)) {
      setErro("O valor mínimo não pode ser maior que o máximo.");
      return;
    }

    setErro(null);
    onAplicar({ ...rascunho, precoMin: min, precoMax: max, pagina: 0 });
  }

  function limpar() {
    setRascunho(FILTROS_INICIAIS);
    setErro(null);
    onAplicar(FILTROS_INICIAIS);
  }

  const campo =
    "w-full rounded-md border border-emerald-300 bg-white px-3 py-2 text-sm text-gray-900 " +
    "focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200";
  const rotulo = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-emerald-900";

  return (
    <form
      onSubmit={aplicar}
      noValidate
      className="space-y-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5"
    >
      <h2 className="text-base font-bold text-emerald-900">Filtrar imóveis</h2>

      <fieldset>
        <legend className={rotulo}>Finalidade</legend>
        <div className="grid grid-cols-3 overflow-hidden rounded-md border border-emerald-300 bg-white text-sm">
          {FINALIDADES.map((f) => {
            const ativo = rascunho.finalidade === f.valor;
            return (
              <button
                key={f.valor || "todas"}
                type="button"
                aria-pressed={ativo}
                onClick={() => alterar("finalidade", f.valor)}
                className={`px-2 py-2 font-medium transition ${
                  ativo ? "bg-emerald-700 text-white" : "text-emerald-900 hover:bg-emerald-100"
                }`}
              >
                {f.rotulo}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className={rotulo}>Faixa de preço (R$)</legend>
        <div className="flex items-center gap-2">
          <input
            aria-label="Preço mínimo"
            className={campo}
            inputMode="decimal"
            placeholder="Mínimo"
            value={rascunho.precoMin}
            onChange={(e) => alterar("precoMin", e.target.value)}
          />
          <span className="text-emerald-800">–</span>
          <input
            aria-label="Preço máximo"
            className={campo}
            inputMode="decimal"
            placeholder="Máximo"
            value={rascunho.precoMax}
            onChange={(e) => alterar("precoMax", e.target.value)}
          />
        </div>
      </fieldset>

      <div>
        <label htmlFor="filtro-bairro" className={rotulo}>
          Bairro
        </label>
        <select
          id="filtro-bairro"
          className={campo}
          value={rascunho.bairroId}
          onChange={(e) => alterar("bairroId", e.target.value)}
        >
          <option value="">Todos os bairros</option>
          {bairros.map((b) => (
            <option key={b.id} value={b.id}>
              {[b.nome, b.cidade].filter(Boolean).join(" - ")}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filtro-ordem" className={rotulo}>
          Ordenar por
        </label>
        <select
          id="filtro-ordem"
          className={campo}
          value={rascunho.ordem}
          onChange={(e) => alterar("ordem", e.target.value)}
        >
          <option value="recentes">Mais recentes</option>
          <option value="preco_asc">Preço: menor para maior</option>
          <option value="preco_desc">Preço: maior para menor</option>
        </select>
      </div>

      {erro && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          {erro}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Aplicar filtros
        </button>
        <button
          type="button"
          onClick={limpar}
          className="rounded-md border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
        >
          Limpar
        </button>
      </div>
    </form>
  );
}
