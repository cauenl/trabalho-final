"use client";

import Link from "next/link";

import { GraficoBarras, GraficoRosca } from "@/components/Graficos";
import Estado from "@/components/ui/Estado";
import { useDados } from "@/hooks/useDados";
import { carregarPainel } from "@/services/painel";

export default function PainelAdmin() {
  const { dados, carregando, erro, recarregar } = useDados(carregarPainel);

  const cartoes = [
    { href: "/admin/imoveis", rotulo: "Imóveis disponíveis", valor: dados?.imoveisDisponiveis },
    { href: "/admin/ofertas", rotulo: "Ofertas pendentes", valor: dados?.ofertasPendentes },
    { href: "/admin/contratos", rotulo: "Contratos aguardando assinatura", valor: dados?.contratosAguardandoAssinatura },
  ];

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Painel</h1>
      <Estado carregando={carregando} erro={erro} aoTentarDeNovo={recarregar}>
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {cartoes.map((c) => (
            <Link key={c.rotulo} href={c.href} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md">
              <p className="text-sm text-gray-500">{c.rotulo}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{c.valor ?? 0}</p>
            </Link>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <GraficoBarras titulo="Imóveis por bairro" itens={dados?.imoveisPorBairro ?? []} />
          <GraficoRosca titulo="Ofertas por situação" itens={dados?.ofertasPorSituacao ?? []} />
          <GraficoRosca titulo="Imóveis por finalidade" itens={dados?.imoveisPorFinalidade ?? []} />
        </div>
      </Estado>
    </>
  );
}
