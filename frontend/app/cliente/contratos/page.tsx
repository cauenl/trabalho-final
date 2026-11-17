"use client";

import { useState } from "react";

import Aviso, { type MensagemTela } from "@/components/ui/Aviso";
import Confirmacao from "@/components/ui/Confirmacao";
import Estado from "@/components/ui/Estado";
import StatusBadge from "@/components/ui/StatusBadge";
import { useDados } from "@/hooks/useDados";
import { ApiError } from "@/lib/api";
import { formatarData, formatarMoeda, ROTULO_TIPO_OFERTA } from "@/lib/formatar";
import { assinarContrato, baixarContrato, meusContratos } from "@/services/contratos";
import type { Contrato } from "@/types/negocio";

export default function MeusContratos() {
  const { dados, carregando, erro, recarregar } = useDados(meusContratos);
  const [alvo, setAlvo] = useState<Contrato | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState<MensagemTela | null>(null);

  async function assinar() {
    if (!alvo) return;
    setOcupado(true);
    try {
      await assinarContrato(alvo.id);
      setMensagem({ tipo: "sucesso", texto: "Contrato assinado! O imóvel agora é seu." });
      recarregar();
    } catch (e) {
      setMensagem({ tipo: "erro", texto: e instanceof ApiError ? e.message : "Erro inesperado." });
    } finally {
      setOcupado(false);
      setAlvo(null);
    }
  }

  async function baixar(c: Contrato) {
    try {
      await baixarContrato(c.id);
    } catch (e) {
      setMensagem({ tipo: "erro", texto: e instanceof ApiError ? e.message : "Não foi possível baixar o PDF." });
    }
  }

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Meus contratos</h1>
      <Aviso mensagem={mensagem} />

      <Estado
        carregando={carregando}
        erro={erro}
        aoTentarDeNovo={recarregar}
        vazio={dados?.length === 0}
        textoVazio="Nenhum contrato enviado a você até agora. Quando uma oferta sua for aceita e o contrato aprovado, ele aparece aqui."
      >
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3">Contrato</th>
                <th className="p-3">Imóvel</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Valor</th>
                <th className="p-3">Situação</th>
                <th className="p-3">Enviado em</th>
                <th className="p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {dados?.map((c) => (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className="p-3">Nº {c.id}</td>
                  <td className="p-3">{c.imovelTitulo}</td>
                  <td className="p-3">{ROTULO_TIPO_OFERTA[c.tipo]}</td>
                  <td className="p-3">{formatarMoeda(c.valor)}</td>
                  <td className="p-3">
                    <StatusBadge status={c.status} />
                    {c.dataAssinatura && <p className="mt-1 text-xs text-gray-500">em {formatarData(c.dataAssinatura)}</p>}
                  </td>
                  <td className="p-3">{formatarData(c.dataAprovacao)}</td>
                  <td className="space-x-3 p-3">
                    <button onClick={() => baixar(c)} className="text-blue-800 hover:underline">
                      Baixar PDF
                    </button>
                    {c.status === "AGUARDANDO_ASSINATURA" && (
                      <button onClick={() => setAlvo(c)} className="rounded bg-blue-700 px-3 py-1 text-white hover:bg-blue-800">
                        Assinar
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
        titulo="Assinar contrato"
        mensagem={`Ao assinar o contrato nº ${alvo?.id} (${alvo?.imovelTitulo}), o imóvel será marcado como ${
          alvo?.tipo === "VENDA" ? "vendido" : "alugado"
        } e as outras ofertas dele serão recusadas. Deseja assinar?`}
        textoConfirmar="Assinar"
        ocupado={ocupado}
        onConfirmar={assinar}
        onCancelar={() => setAlvo(null)}
      />
    </>
  );
}
