"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import FormContato from "@/components/FormContato";
import { ApiError } from "@/lib/api";
import { formatarMoeda } from "@/lib/formatar";
import { buscarImovel, listarFotos, urlFoto } from "@/services/imoveis";
import type { Foto, Imovel } from "@/types/imovel";

interface Dados {
  imovel?: Imovel;
  fotos?: Foto[];
  erro?: string;
}

export default function DetalheImovel({ id }: { id: number }) {
  const [dados, setDados] = useState<Dados | null>(null);
  const [indice, setIndice] = useState(0);
  const [contatoAberto, setContatoAberto] = useState(false);

  useEffect(() => {
    let cancelado = false;

    if (Number.isNaN(id)) {
      Promise.resolve().then(() => {
        if (!cancelado) setDados({ erro: "Item não encontrado." });
      });
      return () => {
        cancelado = true;
      };
    }

    Promise.all([buscarImovel(id), listarFotos(id).catch(() => [] as Foto[])])
      .then(([imovel, fotos]) => {
        if (!cancelado) setDados({ imovel, fotos });
      })
      .catch((e: unknown) => {
        if (!cancelado) setDados({ erro: e instanceof ApiError ? e.message : "Ocorreu um erro inesperado." });
      });

    return () => {
      cancelado = true;
    };
  }, [id]);

  if (!dados) return <p className="p-8 text-gray-600">Carregando imóvel...</p>;

  if (dados.erro || !dados.imovel) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <p className="rounded border border-red-200 bg-red-50 p-4 text-red-700">{dados.erro}</p>
        <Link href="/" className="mt-4 inline-block text-blue-700 underline">
          Voltar à vitrine
        </Link>
      </main>
    );
  }

  const i = dados.imovel;
  const fotos = dados.fotos ?? [];
  const foto = fotos[indice];
  const local = [i.bairro?.nome, i.bairro?.cidade, i.bairro?.estado].filter(Boolean).join(" - ");

  const detalhes: [string, string | number | null][] = [
    ["Dormitórios", i.dormitorios],
    ["Banheiros", i.banheiros],
    ["Vagas de garagem", i.garagem],
    ["Área total", i.areaTotal != null ? `${i.areaTotal} m²` : null],
    ["Área construída", i.areaConstruida != null ? `${i.areaConstruida} m²` : null],
    ["Situação", i.status],
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/" className="text-sm text-blue-700 underline">
        ← Voltar à vitrine
      </Link>

      <p className="mt-4 text-xs font-semibold uppercase text-blue-700">
        {i.tipoImovel?.nome ?? "Imóvel"} · código {i.id}
      </p>
      <h1 className="text-2xl font-bold text-gray-900">{i.titulo}</h1>
      {local && <p className="text-gray-600">{local}</p>}

      <div className="mt-4">
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={urlFoto(foto.id)} alt={i.titulo} className="max-h-96 w-full rounded-lg object-cover" />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100 text-gray-400">Sem foto</div>
        )}

        {fotos.length > 1 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {fotos.map((f, n) => (
              <button key={f.id} onClick={() => setIndice(n)} aria-label={`Foto ${n + 1}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={urlFoto(f.id)}
                  alt=""
                  className={`h-16 w-24 rounded object-cover ${n === indice ? "ring-2 ring-blue-700" : ""}`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 space-y-1">
        {i.precoVenda != null && <p className="text-xl font-bold">Venda: {formatarMoeda(i.precoVenda)}</p>}
        {i.precoAluguel != null && <p className="text-xl font-bold">Aluguel: {formatarMoeda(i.precoAluguel)}</p>}
      </div>

      {i.descricao && <p className="mt-4 text-gray-700">{i.descricao}</p>}

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {detalhes
          .filter(([, v]) => v != null && v !== "")
          .map(([rotulo, valor]) => (
            <div key={rotulo} className="rounded border border-gray-200 p-3">
              <dt className="text-xs text-gray-500">{rotulo}</dt>
              <dd className="font-medium text-gray-900">{valor}</dd>
            </div>
          ))}
      </dl>

      {i.caracteristicas && (
        <p className="mt-4 text-sm text-gray-600">
          <b>Características:</b> {i.caracteristicas}
        </p>
      )}

      {contatoAberto ? (
        <FormContato imovelId={i.id} />
      ) : (
        <button
          onClick={() => setContatoAberto(true)}
          className="mt-6 inline-block rounded bg-blue-700 px-5 py-2.5 font-medium text-white"
        >
          Entrar em contato
        </button>
      )}
    </main>
  );
}
