"use client";

import { useEffect } from "react";

// Janela de confirmação (usada antes de excluir, cancelar, assinar...).
export default function Confirmacao({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = "Confirmar",
  perigo = false,
  ocupado = false,
  onConfirmar,
  onCancelar,
}: {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  perigo?: boolean;
  ocupado?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancelar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aberto, onCancelar]);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="confirmacao-titulo" className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 id="confirmacao-titulo" className="text-lg font-bold text-gray-900">
          {titulo}
        </h2>
        <p className="mt-2 text-sm text-gray-700">{mensagem}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancelar} disabled={ocupado} className="rounded border border-gray-300 px-4 py-2 text-sm disabled:opacity-60">
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={ocupado}
            className={`rounded px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${
              perigo ? "bg-red-700 hover:bg-red-800" : "bg-blue-700 hover:bg-blue-800"
            }`}
          >
            {ocupado ? "Aguarde..." : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
