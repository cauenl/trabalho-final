"use client";

import { useEffect, useState } from "react";

import ImovelCard from "@/components/ImovelCard";
import { ApiError } from "@/lib/api";
import { listarImoveis } from "@/services/imoveis";
import type { Imovel } from "@/types/imovel";

export default function Home() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    listarImoveis()
      .then((dados) => {
        if (!cancelado) setImoveis(dados);
      })
      .catch((e: unknown) => {
        if (!cancelado) {
          setErro(e instanceof ApiError ? e.message : "Ocorreu um erro inesperado.");
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Imóveis</h1>

      {carregando && <p className="text-gray-600">Carregando imóveis...</p>}

      {!carregando && erro && (
        <p className="rounded border border-red-200 bg-red-50 p-4 text-red-700">{erro}</p>
      )}

      {!carregando && !erro && imoveis.length === 0 && (
        <p className="text-gray-600">Nenhum imóvel encontrado.</p>
      )}

      {!carregando && !erro && imoveis.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {imoveis.map((imovel) => (
            <ImovelCard key={imovel.id} imovel={imovel} />
          ))}
        </div>
      )}
    </main>
  );
}
