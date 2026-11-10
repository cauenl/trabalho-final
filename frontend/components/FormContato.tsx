"use client";

import { useState, type FormEvent } from "react";

import { useSessao } from "@/hooks/useSessao";
import { ApiError } from "@/lib/api";
import { enviarContato } from "@/services/imoveis";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Erros {
  nome?: string;
  email?: string;
  telefone?: string;
  geral?: string;
}

// Formulário "Entrar em contato": envia um e-mail para a imobiliária (pelo Mailgun).
// O assunto e o corpo (código, tipo, bairro e valor do imóvel) são montados pelo backend.
export default function FormContato({ imovelId }: { imovelId: number }) {
  const { sessao } = useSessao();

  const [nome, setNome] = useState("");
  const [emailDigitado, setEmailDigitado] = useState<string | null>(null);
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("Olá! Tenho interesse neste imóvel e gostaria de mais informações.");
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  // se a pessoa estiver logada, sugere o e-mail da sessão (ela ainda pode trocar)
  const email = emailDigitado ?? sessao?.email ?? "";

  function validar(): Erros {
    const e: Erros = {};
    if (!nome.trim()) e.nome = "Informe o seu nome.";
    if (!email.trim()) e.email = "Informe o seu e-mail.";
    else if (!EMAIL.test(email.trim())) e.email = "Informe um e-mail válido.";
    if (telefone.trim() && !/^[\d\s()+-]{8,20}$/.test(telefone.trim())) {
      e.telefone = "Informe um telefone válido, só com números, espaços, ( ) + e -.";
    }
    return e;
  }

  async function enviar(ev: FormEvent) {
    ev.preventDefault();
    const encontrados = validar();
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      await enviarContato(imovelId, {
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        mensagem: mensagem.trim(),
      });
      setEnviado(true);
    } catch (erro) {
      setErros({ geral: erro instanceof ApiError ? erro.message : "Ocorreu um erro inesperado." });
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div role="status" className="mt-4 rounded border border-green-200 bg-green-50 p-4 text-green-800">
        <p className="font-medium">Mensagem enviada!</p>
        <p className="text-sm">A imobiliária recebeu o seu interesse e responderá para {email.trim()}.</p>
      </div>
    );
  }

  const campo = "w-full rounded border border-gray-300 px-3 py-2 text-sm";

  return (
    <form onSubmit={enviar} noValidate className="mt-4 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="text-lg font-semibold text-gray-900">Entrar em contato</h2>
      <p className="text-sm text-gray-600">
        Enviamos um e-mail para a imobiliária com o código, o tipo, o bairro e o valor deste imóvel.
      </p>

      <div>
        <label htmlFor="contato-nome" className="mb-1 block text-sm font-medium text-gray-700">
          Seu nome
        </label>
        <input id="contato-nome" className={campo} value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" />
        {erros.nome && <p className="mt-1 text-sm text-red-600">{erros.nome}</p>}
      </div>

      <div>
        <label htmlFor="contato-email" className="mb-1 block text-sm font-medium text-gray-700">
          Seu e-mail
        </label>
        <input
          id="contato-email"
          type="email"
          className={campo}
          value={email}
          onChange={(e) => setEmailDigitado(e.target.value)}
          autoComplete="email"
        />
        {erros.email && <p className="mt-1 text-sm text-red-600">{erros.email}</p>}
      </div>

      <div>
        <label htmlFor="contato-telefone" className="mb-1 block text-sm font-medium text-gray-700">
          Telefone (opcional)
        </label>
        <input
          id="contato-telefone"
          className={campo}
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          autoComplete="tel"
          inputMode="tel"
        />
        {erros.telefone && <p className="mt-1 text-sm text-red-600">{erros.telefone}</p>}
      </div>

      <div>
        <label htmlFor="contato-mensagem" className="mb-1 block text-sm font-medium text-gray-700">
          Mensagem
        </label>
        <textarea
          id="contato-mensagem"
          className={campo}
          rows={4}
          maxLength={2000}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
        />
      </div>

      {erros.geral && (
        <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {erros.geral}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="rounded bg-blue-700 px-5 py-2.5 font-medium text-white disabled:opacity-60"
      >
        {enviando ? "Enviando..." : "Enviar mensagem"}
      </button>
    </form>
  );
}
