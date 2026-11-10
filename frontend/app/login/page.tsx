"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { useSessao } from "@/hooks/useSessao";
import { ApiError } from "@/lib/api";
import { areaInicial, assinar, limparAviso, obterAviso } from "@/lib/auth";
import { entrar } from "@/services/auth";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Erros {
  email?: string;
  senha?: string;
  geral?: string;
}

function validar(email: string, senha: string): Erros {
  const erros: Erros = {};
  if (!email.trim()) erros.email = "Informe o e-mail.";
  else if (!EMAIL.test(email.trim())) erros.email = "Informe um e-mail válido.";
  if (!senha) erros.senha = "Informe a senha.";
  return erros;
}

export default function LoginPage() {
  const router = useRouter();
  const { sessao, pronto } = useSessao();
  const aviso = useSyncExternalStore(assinar, obterAviso, () => null);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);

  // quem já está logado vai direto para a sua área
  useEffect(() => {
    if (pronto && sessao) router.replace(areaInicial(sessao.tipo));
  }, [pronto, sessao, router]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const encontrados = validar(email, senha);
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      await entrar(email.trim(), senha);
      limparAviso(); // o useEffect acima leva cada perfil à sua área
      // o Next preserva o estado desta tela ao navegar: limpa para o próximo login
      setEmail("");
      setSenha("");
      setEnviando(false);
    } catch (erro) {
      const mensagem =
        erro instanceof ApiError
          ? erro.status === 401
            ? "E-mail ou senha incorretos."
            : erro.message
          : "Ocorreu um erro inesperado.";
      setErros({ geral: mensagem });
      setEnviando(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Entrar</h1>

      {aviso && (
        <p className="mb-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {aviso}
        </p>
      )}

      <form onSubmit={enviar} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
          {erros.email && <p className="mt-1 text-sm text-red-600">{erros.email}</p>}
        </div>

        <div>
          <label htmlFor="senha" className="mb-1 block text-sm font-medium text-gray-700">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
          {erros.senha && <p className="mt-1 text-sm text-red-600">{erros.senha}</p>}
        </div>

        {erros.geral && (
          <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {erros.geral}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded bg-blue-700 px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
