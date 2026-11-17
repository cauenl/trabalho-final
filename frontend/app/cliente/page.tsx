"use client";

import Link from "next/link";

import Estado from "@/components/ui/Estado";
import { useDados } from "@/hooks/useDados";
import { useSessao } from "@/hooks/useSessao";
import { meusContratos } from "@/services/contratos";
import { idsFavoritos } from "@/services/favoritos";
import { minhasOfertas } from "@/services/ofertas";

export default function ResumoCliente() {
  const { sessao } = useSessao();
  const { dados, carregando, erro, recarregar } = useDados(async () => {
    const [ofertas, contratos, favoritos] = await Promise.all([minhasOfertas(), meusContratos(), idsFavoritos()]);
    return { ofertas, contratos, favoritos };
  });

  const paraAssinar = dados?.contratos.filter((c) => c.status === "AGUARDANDO_ASSINATURA").length ?? 0;
  const cartoes = [
    { href: "/cliente/ofertas", rotulo: "Ofertas pendentes", valor: dados?.ofertas.filter((o) => o.status === "PENDENTE").length },
    { href: "/cliente/ofertas", rotulo: "Ofertas aceitas", valor: dados?.ofertas.filter((o) => o.status === "ACEITA").length },
    { href: "/cliente/favoritos", rotulo: "Imóveis favoritos", valor: dados?.favoritos.length },
    { href: "/cliente/contratos", rotulo: "Contratos para assinar", valor: paraAssinar },
  ];

  return (
    <>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Área do cliente</h1>
      <p className="mb-6 text-gray-600">Logado como {sessao?.email}.</p>

      <Estado carregando={carregando} erro={erro} aoTentarDeNovo={recarregar}>
        {paraAssinar > 0 && (
          <p role="status" className="mb-4 rounded border border-blue-200 bg-blue-50 p-3 text-blue-800">
            Você tem {paraAssinar} contrato(s) aguardando a sua assinatura.{" "}
            <Link href="/cliente/contratos" className="font-medium underline">
              Ver contratos
            </Link>
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cartoes.map((c) => (
            <Link key={c.rotulo} href={c.href} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md">
              <p className="text-sm text-gray-500">{c.rotulo}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{c.valor ?? 0}</p>
            </Link>
          ))}
        </div>
      </Estado>
    </>
  );
}
