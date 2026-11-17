"use client";

import { useState } from "react";

// Paginação no cliente para as tabelas do painel. `chave` identifica o filtro atual: ao mudar, volta à página 1.
export function usePagina<T>(itens: T[] | undefined, chave = "", tamanho = 10) {
  const [estado, setEstado] = useState({ chave, pagina: 0 });
  const total = itens?.length ?? 0;
  const totalPaginas = Math.max(1, Math.ceil(total / tamanho));
  const pedida = estado.chave === chave ? estado.pagina : 0;
  const pagina = Math.min(pedida, totalPaginas - 1);

  return {
    pagina,
    totalPaginas,
    total,
    itensDaPagina: itens?.slice(pagina * tamanho, (pagina + 1) * tamanho),
    mudar: (nova: number) => setEstado({ chave, pagina: nova }),
  };
}
