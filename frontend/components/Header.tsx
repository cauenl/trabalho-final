"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useSessao } from "@/hooks/useSessao";
import { areaInicial, encerrarSessao, ROTULO_PERFIL } from "@/lib/auth";

const ROTULO_AREA = { ADMIN: "Painel", CORRETOR: "Meu painel", USER: "Minha área" } as const;

export default function Header() {
  const { sessao, pronto } = useSessao();
  const router = useRouter();

  function sair() {
    encerrarSessao(); // apaga o token
    router.replace("/login"); // redireciona
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3 text-sm">
        <Link href="/" className="text-lg font-bold text-blue-800">
          Imobiliária
        </Link>
        <Link href="/" className="text-gray-700 hover:underline">
          Vitrine
        </Link>

        <span className="flex-1" />

        {pronto && !sessao && (
          <Link href="/login" className="rounded bg-blue-700 px-3 py-1.5 text-white">
            Entrar
          </Link>
        )}

        {/* o menu mostra só as opções do perfil logado */}
        {pronto && sessao && (
          <>
            <Link href={areaInicial(sessao.tipo)} className="font-medium text-blue-800 hover:underline">
              {ROTULO_AREA[sessao.tipo]}
            </Link>
            <span className="text-gray-500">
              {sessao.email}{" "}
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                {ROTULO_PERFIL[sessao.tipo]}
              </span>
            </span>
            <button onClick={sair} className="rounded border border-gray-300 px-3 py-1.5">
              Sair
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
