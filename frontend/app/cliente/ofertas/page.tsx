"use client";

import Link from "next/link";
import { useState } from "react";

import Aviso, { type MensagemTela } from "@/components/ui/Aviso";
import Confirmacao from "@/components/ui/Confirmacao";
import Estado from "@/components/ui/Estado";
import StatusBadge from "@/components/ui/StatusBadge";
import { useDados } from "@/hooks/useDados";
import { ApiError } from "@/lib/api";
import { formatarData, formatarMoeda, ROTULO_TIPO_OFERTA } from "@/lib/formatar";
import { cancelarOferta, minhasOfertas } from "@/services/ofertas";
import type { Oferta } from "@/types/negocio";

export default function MinhasOfertas() {
  const { dados, carregando, erro, recarregar } = useDados(minhasOfertas);
  const [alvo, setAlvo] = useState<Oferta | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState<MensagemTela | null>(null);

  async function cancelar() {
    if (!alvo) return;
    setOcupado(true);
    try {
      await cancelarOferta(alvo.id);
      setMensagem({ tipo: "sucesso", texto: "Oferta cancelada." });
      recarregar();
    } catch (e) {
      setMensagem({ tipo: "erro", texto: e instanceof ApiError ? e.message : "Erro inesperado." });
    } finally {
      setOcupado(false);
      setAlvo(null);
    }
  }

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Minhas ofertas</h1>
      <Aviso mensagem={mensagem} />

      <Estado
        carregando={carregando}
        erro={erro}
        aoTentarDeNovo={recarregar}
        vazio={dados?.length === 0}
        textoVazio="Você ainda não fez nenhuma oferta. Escolha um imóvel na vitrine."
      >
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3">Imóvel</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Valor proposto</th>
                <th className="p-3">Situação</th>
                <th className="p-3">Enviada em</th>
                <th className="p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {dados?.map((o) => (
                <tr key={o.id} className="border-t border-gray-100">
                  <td className="p-3">
                    <Link href={`/imoveis/${o.imovelId}`} className="font-medium text-blue-800 hover:underline">
                      {o.imovelTitulo}
                    </Link>
                    {o.bairro && <p className="text-xs text-gray-500">{o.bairro}</p>}
                  </td>
                  <td className="p-3">{ROTULO_TIPO_OFERTA[o.tipo]}</td>
                  <td className="p-3">{formatarMoeda(o.valorProposto)}</td>
                  <td className="p-3">
                    <StatusBadge status={o.status} />
                    {o.status === "EM_ESPERA" && <p className="mt-1 text-xs text-gray-500">O imóvel está reservado para outra oferta.</p>}
                  </td>
                  <td className="p-3">{formatarData(o.criadoEm)}</td>
                  <td className="p-3">
                    {o.contratoStatus === "AGUARDANDO_ASSINATURA" && (
                      <Link href="/cliente/contratos" className="mr-3 text-blue-800 underline">
                        Assinar contrato
                      </Link>
                    )}
                    {(o.status === "PENDENTE" || o.status === "EM_ESPERA") && (
                      <button onClick={() => setAlvo(o)} className="text-red-700 hover:underline">
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Estado>

      <Confirmacao
        aberto={alvo !== null}
        titulo="Cancelar oferta"
        mensagem={`Deseja cancelar a sua oferta de ${formatarMoeda(alvo?.valorProposto)} para "${alvo?.imovelTitulo}"?`}
        textoConfirmar="Cancelar oferta"
        perigo
        ocupado={ocupado}
        onConfirmar={cancelar}
        onCancelar={() => setAlvo(null)}
      />
    </>
  );
}
