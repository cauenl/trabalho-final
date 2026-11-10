"use client";

import { useEffect, useState, type FormEvent } from "react";

import { listarBairros } from "@/services/bairros";
import { FILTROS_INICIAIS, type FiltrosBusca } from "@/services/imoveis";
import type { Bairro } from "@/types/imovel";

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

  const campo = "w-full rounded border border-gray-300 px-2 py-1.5 text-sm";

  return (
    <form onSubmit={aplicar} noValidate className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-sm">
          Bairro
          <select className={campo} value={rascunho.bairroId} onChange={(e) => alterar("bairroId", e.target.value)}>
            <option value="">Todos</option>
            {bairros.map((b) => (
              <option key={b.id} value={b.id}>
                {[b.nome, b.cidade].filter(Boolean).join(" - ")}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          Finalidade
          <select className={campo} value={rascunho.finalidade} onChange={(e) => alterar("finalidade", e.target.value)}>
            <option value="">Todas</option>
            <option value="VENDA">Venda</option>
            <option value="ALUGUEL">Aluguel</option>
          </select>
        </label>

        <label className="text-sm">
          Preço mínimo
          <input className={campo} inputMode="decimal" placeholder="0" value={rascunho.precoMin} onChange={(e) => alterar("precoMin", e.target.value)} />
        </label>

        <label className="text-sm">
          Preço máximo
          <input className={campo} inputMode="decimal" placeholder="sem limite" value={rascunho.precoMax} onChange={(e) => alterar("precoMax", e.target.value)} />
        </label>

        <label className="text-sm">
          Ordenar por
          <select className={campo} value={rascunho.ordem} onChange={(e) => alterar("ordem", e.target.value)}>
            <option value="recentes">Mais recentes</option>
            <option value="preco_asc">Preço: menor para maior</option>
            <option value="preco_desc">Preço: maior para menor</option>
          </select>
        </label>
      </div>

      {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}

      <div className="mt-4 flex gap-2">
        <button type="submit" className="rounded bg-blue-700 px-4 py-1.5 text-sm text-white">
          Aplicar
        </button>
        <button type="button" onClick={limpar} className="rounded border border-gray-300 px-4 py-1.5 text-sm">
          Limpar
        </button>
      </div>
    </form>
  );
}
