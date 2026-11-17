"use client";

import { useState } from "react";

import { useFavoritos } from "@/components/FavoritosProvider";

// Coração de favoritar. Só aparece para o cliente logado.
export default function FavoritoBotao({
  imovelId,
  aoAlterar,
  comTexto = false,
}: {
  imovelId: number;
  aoAlterar?: () => void;
  comTexto?: boolean;
}) {
  const { habilitado, ehFavorito, alternar } = useFavoritos();
  const [erro, setErro] = useState<string | null>(null);

  if (!habilitado) return null;

  const favorito = ehFavorito(imovelId);

  async function clicar(e: React.MouseEvent) {
    e.preventDefault(); // o botão fica dentro do card, que é um link
    e.stopPropagation();
    setErro(null);
    try {
      await alternar(imovelId);
      aoAlterar?.();
    } catch {
      setErro("Não foi possível atualizar os favoritos.");
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={clicar}
        aria-pressed={favorito}
        aria-label={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        title={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        className={`rounded-full border px-2.5 py-1 text-sm ${
          favorito ? "border-rose-300 bg-rose-50 text-rose-600" : "border-gray-300 bg-white text-gray-500 hover:text-rose-600"
        }`}
      >
        {favorito ? "♥" : "♡"}
        {comTexto && <span className="ml-1.5">{favorito ? "Favorito" : "Favoritar"}</span>}
      </button>
      {erro && (
        <span role="alert" className="text-xs text-red-600">
          {erro}
        </span>
      )}
    </span>
  );
}
