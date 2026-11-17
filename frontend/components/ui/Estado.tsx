import type { ReactNode } from "react";

// Mostra os três estados de uma tela que busca dados: carregando, erro amigável e sem resultados.
export default function Estado({
  carregando,
  erro,
  vazio,
  textoVazio = "Nenhum registro encontrado.",
  aoTentarDeNovo,
  children,
}: {
  carregando: boolean;
  erro?: string;
  vazio?: boolean;
  textoVazio?: string;
  aoTentarDeNovo?: () => void;
  children: ReactNode;
}) {
  if (carregando) {
    return (
      <p role="status" className="py-6 text-gray-600">
        Carregando...
      </p>
    );
  }

  if (erro) {
    return (
      <div role="alert" className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
        <p>{erro}</p>
        {aoTentarDeNovo && (
          <button onClick={aoTentarDeNovo} className="mt-2 text-sm underline">
            Tentar de novo
          </button>
        )}
      </div>
    );
  }

  if (vazio) {
    return <p className="py-6 text-gray-600">{textoVazio}</p>;
  }

  return <>{children}</>;
}
