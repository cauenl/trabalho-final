"use client";

import Link from "next/link";

import ImovelCard from "@/components/ImovelCard";
import Estado from "@/components/ui/Estado";
import { useDados } from "@/hooks/useDados";
import { listarFavoritos } from "@/services/favoritos";

export default function Favoritos() {
  const { dados, carregando, erro, recarregar } = useDados(listarFavoritos);

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Meus favoritos</h1>

      <Estado
        carregando={carregando}
        erro={erro}
        aoTentarDeNovo={recarregar}
        vazio={dados?.length === 0}
        textoVazio="Você ainda não favoritou nenhum imóvel."
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dados?.map((imovel) => (
            <ImovelCard key={imovel.id} imovel={imovel} aoAlterarFavorito={recarregar} />
          ))}
        </div>
      </Estado>

      {dados?.length === 0 && (
        <Link href="/" className="mt-2 inline-block text-blue-800 underline">
          Ver a vitrine
        </Link>
      )}
    </>
  );
}
