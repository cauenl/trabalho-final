"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useSessao } from "@/hooks/useSessao";
import { areaInicial, type Perfil } from "@/lib/auth";

// Só mostra o conteúdo se houver sessão com um dos perfis permitidos.
// Sem token -> login. Perfil errado -> a área inicial do próprio perfil.
export default function Protegido({ perfis, children }: { perfis: Perfil[]; children: ReactNode }) {
  const { sessao, pronto } = useSessao();
  const router = useRouter();
  const permitido = sessao !== null && perfis.includes(sessao.tipo);

  useEffect(() => {
    if (!pronto) return;
    if (!sessao) router.replace("/login");
    else if (!permitido) router.replace(areaInicial(sessao.tipo));
  }, [pronto, sessao, permitido, router]);

  if (!permitido) {
    return <p className="p-8 text-gray-600">Verificando acesso...</p>;
  }
  return <>{children}</>;
}
