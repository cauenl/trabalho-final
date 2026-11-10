"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useSessao } from "@/hooks/useSessao";
import { encerrarSessao } from "@/lib/auth";

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

        {pronto && sessao?.tipo === "USER" && (
          <Link href="/cliente" className="text-gray-700 hover:underline">
            Minha área
          </Link>
        )}
        {pronto && sessao?.tipo === "ADMIN" && (
          <Link href="/admin" className="text-gray-700 hover:underline">
            Painel
          </Link>
        )}

        {pronto && sessao && (
          <>
            <span className="text-gray-500">{sessao.email}</span>
            <button onClick={sair} className="rounded border border-gray-300 px-3 py-1.5">
              Sair
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
