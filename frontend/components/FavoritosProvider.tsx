"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { useDados } from "@/hooks/useDados";
import { useSessao } from "@/hooks/useSessao";
import { desfavoritar, favoritar, idsFavoritos } from "@/services/favoritos";

interface Contexto {
  // só o cliente (USER) tem favoritos
  habilitado: boolean;
  ehFavorito: (imovelId: number) => boolean;
  alternar: (imovelId: number) => Promise<void>;
}

const FavoritosContexto = createContext<Contexto>({
  habilitado: false,
  ehFavorito: () => false,
  alternar: async () => {},
});

export function useFavoritos() {
  return useContext(FavoritosContexto);
}

export default function FavoritosProvider({ children }: { children: ReactNode }) {
  const { sessao } = useSessao();
  const habilitado = sessao?.tipo === "USER";
  const { dados } = useDados(
    () => (habilitado ? idsFavoritos() : Promise.resolve([] as number[])),
    habilitado ? `usuario-${sessao?.id}` : "sem-favoritos",
  );
  // mudanças feitas na tela, aplicadas na hora (antes da resposta do servidor)
  const [alteracoes, setAlteracoes] = useState<Record<number, boolean>>({});

  const ehFavorito = (imovelId: number) => alteracoes[imovelId] ?? dados?.includes(imovelId) ?? false;

  async function alternar(imovelId: number) {
    const novo = !ehFavorito(imovelId);
    setAlteracoes((a) => ({ ...a, [imovelId]: novo }));
    try {
      if (novo) await favoritar(imovelId);
      else await desfavoritar(imovelId);
    } catch (erro) {
      setAlteracoes((a) => ({ ...a, [imovelId]: !novo })); // desfaz
      throw erro;
    }
  }

  return (
    <FavoritosContexto.Provider value={{ habilitado, ehFavorito, alternar }}>
      {children}
    </FavoritosContexto.Provider>
  );
}
