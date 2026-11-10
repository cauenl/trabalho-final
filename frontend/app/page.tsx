"use client";

import { useEffect, useState } from "react";

import FiltrosVitrine from "@/components/FiltrosVitrine";
import ImovelCard from "@/components/ImovelCard";
import Paginacao from "@/components/Paginacao";
import { ApiError } from "@/lib/api";
import { buscarVitrine, FILTROS_INICIAIS, type FiltrosBusca } from "@/services/imoveis";
import type { ImovelResumo, Pagina } from "@/types/imovel";

interface Resultado {
  chave: string;
  dados?: Pagina<ImovelResumo>;
  erro?: string;
}

export default function Home() {
  const [filtros, setFiltros] = useState<FiltrosBusca>(FILTROS_INICIAIS);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const chave = JSON.stringify(filtros);

  useEffect(() => {
    let cancelado = false;
    const f = JSON.parse(chave) as FiltrosBusca;

    buscarVitrine(f)
      .then((dados) => {
        if (!cancelado) setResultado({ chave, dados });
      })
      .catch((e: unknown) => {
        if (!cancelado) {
          setResultado({ chave, erro: e instanceof ApiError ? e.message : "Ocorreu um erro inesperado." });
        }
      });

    return () => {
      cancelado = true;
    };
  }, [chave]);

  // enquanto o resultado guardado não é o da busca atual, está carregando
  const carregando = resultado?.chave !== chave;
  const dados = !carregando ? resultado?.dados : undefined;
  const erro = !carregando ? resultado?.erro : undefined;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Imóveis disponíveis</h1>

      {/* filtros em coluna lateral (fixa ao rolar); em telas pequenas ficam acima da lista */}
      <div className="grid gap-6 lg:grid-cols-[17rem_1fr] lg:items-start">
        <aside className="lg:sticky lg:top-4">
          <FiltrosVitrine valor={filtros} onAplicar={setFiltros} />
        </aside>

        <section>
          {carregando && <p className="text-gray-600">Carregando imóveis...</p>}

          {erro && <p className="rounded border border-red-200 bg-red-50 p-4 text-red-700">{erro}</p>}

          {dados && dados.conteudo.length === 0 && (
            <p className="text-gray-600">Nenhum imóvel encontrado com esses filtros.</p>
          )}

          {dados && dados.conteudo.length > 0 && (
            <>
              <p className="mb-3 text-sm text-gray-500">
                {dados.totalElementos} imóvel(is) · página {dados.pagina + 1} de {dados.totalPaginas}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {dados.conteudo.map((imovel) => (
                  <ImovelCard key={imovel.id} imovel={imovel} />
                ))}
              </div>
              <Paginacao
                pagina={dados.pagina}
                totalPaginas={dados.totalPaginas}
                onMudar={(p) => setFiltros((f) => ({ ...f, pagina: p }))}
              />
            </>
          )}
        </section>
      </div>
    </main>
  );
}
