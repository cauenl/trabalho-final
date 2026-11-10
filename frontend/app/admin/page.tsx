"use client";

import Protegido from "@/components/Protegido";
import { useSessao } from "@/hooks/useSessao";

export default function PainelAdmin() {
  const { sessao } = useSessao();

  return (
    <Protegido perfis={["ADMIN"]}>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Painel do administrador</h1>
        <p className="text-gray-600">Logado como {sessao?.email}.</p>
        <p className="mt-4 text-sm text-gray-500">
          Os cadastros e a gestão serão adicionados nas próximas etapas.
        </p>
      </main>
    </Protegido>
  );
}
