"use client";

import { useSyncExternalStore } from "react";

import { assinar, obterSessao } from "@/lib/auth";

const semAssinatura = () => () => {};

export function useSessao() {
  const sessao = useSyncExternalStore(assinar, obterSessao, () => null);
  // "pronto" só vira true no navegador, depois de ler o localStorage
  const pronto = useSyncExternalStore(semAssinatura, () => true, () => false);
  return { sessao, pronto };
}
