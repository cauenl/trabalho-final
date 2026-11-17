"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import Aviso, { type MensagemTela } from "@/components/ui/Aviso";
import { useSessao } from "@/hooks/useSessao";
import { ApiError } from "@/lib/api";
import { formatarMoeda } from "@/lib/formatar";
import { criarOferta } from "@/services/ofertas";
import type { TipoOferta } from "@/types/negocio";

interface Props {
  imovelId: number;
  precoVenda: number | null;
  precoAluguel: number | null;
  disponivel: boolean;
}

// Formulário de oferta: só o cliente (USER) pode enviar; visitante é convidado a entrar.
export default function FormOferta({ imovelId, precoVenda, precoAluguel, disponivel }: Props) {
  const { sessao } = useSessao();
  const tipos: TipoOferta[] = [];
  if (precoVenda != null) tipos.push("VENDA");
  if (precoAluguel != null) tipos.push("ALUGUEL");

  const [tipo, setTipo] = useState<TipoOferta>(tipos[0] ?? "VENDA");
  const [valor, setValor] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<MensagemTela | null>(null);

  if (tipos.length === 0) return null;

  // reservado, alugado ou vendido: sem botão de oferta
  if (!disponivel) return null;

  if (!sessao) {
    return (
      <p className="mt-6 rounded border border-gray-200 bg-gray-50 p-3 text-gray-700">
        <Link href="/login" className="font-medium text-blue-800 underline">
          Entre como cliente
        </Link>{" "}
        para fazer uma oferta neste imóvel.
      </p>
    );
  }

  if (sessao.tipo !== "USER") return null; // equipe não faz ofertas

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const numero = Number(valor.replace(",", "."));
    if (!numero || numero <= 0) {
      setResultado({ tipo: "erro", texto: "Informe um valor maior que zero." });
      return;
    }
    setEnviando(true);
    setResultado(null);
    try {
      await criarOferta({ imovelId, tipo, valor: numero, mensagem });
      setResultado({ tipo: "sucesso", texto: "Oferta enviada! Acompanhe em Minhas ofertas." });
      setValor("");
      setMensagem("");
    } catch (err) {
      setResultado({ tipo: "erro", texto: err instanceof ApiError ? err.message : "Erro inesperado." });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="mt-6 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="text-lg font-semibold text-gray-900">Fazer oferta</h2>
      <Aviso mensagem={resultado} />

      {tipos.length > 1 && (
        <label className="block text-sm">
          Tipo
          <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoOferta)} className="mt-1 block w-full rounded border border-gray-300 p-2">
            <option value="VENDA">Compra ({formatarMoeda(precoVenda)})</option>
            <option value="ALUGUEL">Aluguel ({formatarMoeda(precoAluguel)})</option>
          </select>
        </label>
      )}

      <label className="block text-sm">
        Valor proposto (R$)
        <input
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          inputMode="decimal"
          required
          className="mt-1 block w-full rounded border border-gray-300 p-2"
        />
      </label>

      <label className="block text-sm">
        Mensagem (opcional)
        <textarea
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          rows={3}
          maxLength={500}
          className="mt-1 block w-full rounded border border-gray-300 p-2"
        />
      </label>

      <button disabled={enviando} className="rounded bg-blue-700 px-5 py-2 font-medium text-white disabled:opacity-60">
        {enviando ? "Enviando..." : "Enviar oferta"}
      </button>
    </form>
  );
}
