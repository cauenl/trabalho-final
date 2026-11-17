"use client";

import { useEffect, useRef, useState } from "react";

import { ApiError } from "@/lib/api";

interface Resultado<T> {
  chave: string;
  dados?: T;
  erro?: string;
}

// Carrega dados de uma tela e entrega os três estados: carregando, erro (mensagem amigável) e dados.
// `chave` identifica a busca: quando muda, recarrega. `recarregar()` busca de novo.
export function useDados<T>(carregar: () => Promise<T>, chave = "") {
  const [versao, setVersao] = useState(0);
  const [resultado, setResultado] = useState<Resultado<T> | null>(null);
  const funcao = useRef(carregar);
  const k = `${chave}#${versao}`;

  useEffect(() => {
    funcao.current = carregar;
  });

  useEffect(() => {
    let cancelado = false;
    funcao
      .current()
      .then((dados) => {
        if (!cancelado) setResultado({ chave: k, dados });
      })
      .catch((e: unknown) => {
        if (!cancelado) {
          setResultado({ chave: k, erro: e instanceof ApiError ? e.message : "Ocorreu um erro inesperado." });
        }
      });
    return () => {
      cancelado = true;
    };
  }, [k]);

  const carregando = resultado?.chave !== k;
  return {
    carregando,
    dados: carregando ? undefined : resultado?.dados,
    erro: carregando ? undefined : resultado?.erro,
    recarregar: () => setVersao((v) => v + 1),
  };
}
