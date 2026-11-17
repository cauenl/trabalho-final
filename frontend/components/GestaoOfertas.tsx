"use client";

import { useState } from "react";

import Aviso, { type MensagemTela } from "@/components/ui/Aviso";
import Confirmacao from "@/components/ui/Confirmacao";
import Estado from "@/components/ui/Estado";
import StatusBadge from "@/components/ui/StatusBadge";
import { useDados } from "@/hooks/useDados";
import { ApiError } from "@/lib/api";
import { formatarData, formatarMoeda, ROTULO_TIPO_OFERTA } from "@/lib/formatar";
import { prepararContrato } from "@/services/contratos";
import { aceitarOferta, listarOfertas, recusarOferta } from "@/services/ofertas";
import type { Oferta } from "@/types/negocio";

type Acao = "aceitar" | "recusar" | "preparar";

const TEXTOS: Record<Acao, { titulo: string; botao: string; perigo: boolean }> = {
  aceitar: { titulo: "Aceitar oferta", botao: "Aceitar", perigo: false },
  recusar: { titulo: "Recusar oferta", botao: "Recusar", perigo: true },
  preparar: { titulo: "Preparar contrato", botao: "Preparar", perigo: false },
};

const FILTROS = [
  ["", "Todas"],
  ["PENDENTE", "Pendentes"],
  ["ACEITA", "Aceitas"],
  ["EM_ESPERA", "Em espera"],
  ["RECUSADA", "Recusadas"],
  ["CANCELADA", "Canceladas"],
];

// Tela de ofertas da equipe (corretor e admin): aceitar, recusar e preparar o contrato.
export default function GestaoOfertas() {
  const [status, setStatus] = useState("");
  const { dados, carregando, erro, recarregar } = useDados(() => listarOfertas(status), status);
  const [alvo, setAlvo] = useState<{ oferta: Oferta; acao: Acao } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState<MensagemTela | null>(null);

  async function executar() {
    if (!alvo) return;
    setOcupado(true);
    try {
      if (alvo.acao === "aceitar") await aceitarOferta(alvo.oferta.id);
      if (alvo.acao === "recusar") await recusarOferta(alvo.oferta.id);
      if (alvo.acao === "preparar") await prepararContrato(alvo.oferta.id);
      const feito = { aceitar: "Oferta aceita. O imóvel ficou reservado.", recusar: "Oferta recusada.", preparar: "Contrato preparado e enviado ao administrador para aprovação." };
      setMensagem({ tipo: "sucesso", texto: feito[alvo.acao] });
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
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Ofertas recebidas</h1>

      <label className="mb-4 block text-sm">
        Situação{" "}
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="ml-2 rounded border border-gray-300 p-1.5">
          {FILTROS.map(([v, r]) => (
            <option key={v} value={v}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <Aviso mensagem={mensagem} />

      <Estado carregando={carregando} erro={erro} aoTentarDeNovo={recarregar} vazio={dados?.length === 0} textoVazio="Nenhuma oferta encontrada.">
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3">Imóvel</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Valor</th>
                <th className="p-3">Situação</th>
                <th className="p-3">Data</th>
                <th className="p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {dados?.map((o) => (
                <tr key={o.id} className="border-t border-gray-100 align-top">
                  <td className="p-3">
                    {o.imovelTitulo}
                    {o.imovelStatus && <p className="text-xs text-gray-500">{o.imovelStatus}</p>}
                  </td>
                  <td className="p-3">
                    {o.usuarioNome}
                    <p className="text-xs text-gray-500">{o.usuarioEmail}</p>
                    {o.mensagem && <p className="mt-1 text-xs italic text-gray-600">“{o.mensagem}”</p>}
                  </td>
                  <td className="p-3">{ROTULO_TIPO_OFERTA[o.tipo]}</td>
                  <td className="p-3">{formatarMoeda(o.valorProposto)}</td>
                  <td className="p-3">
                    <StatusBadge status={o.status} />
                    {o.contratoStatus && <p className="mt-1 text-xs text-gray-500">Contrato: <StatusBadge status={o.contratoStatus} /></p>}
                  </td>
                  <td className="p-3">{formatarData(o.criadoEm)}</td>
                  <td className="space-x-3 p-3">
                    {o.status === "PENDENTE" && (
                      <>
                        <button onClick={() => setAlvo({ oferta: o, acao: "aceitar" })} className="text-green-700 hover:underline">
                          Aceitar
                        </button>
                        <button onClick={() => setAlvo({ oferta: o, acao: "recusar" })} className="text-red-700 hover:underline">
                          Recusar
                        </button>
                      </>
                    )}
                    {o.status === "ACEITA" && (!o.contratoId || o.contratoStatus === "CANCELADO") && (
                      <button onClick={() => setAlvo({ oferta: o, acao: "preparar" })} className="rounded bg-blue-700 px-3 py-1 text-white hover:bg-blue-800">
                        Preparar contrato
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
        titulo={alvo ? TEXTOS[alvo.acao].titulo : ""}
        mensagem={
          alvo
            ? `${TEXTOS[alvo.acao].titulo}: ${formatarMoeda(alvo.oferta.valorProposto)} de ${alvo.oferta.usuarioNome} para "${alvo.oferta.imovelTitulo}"?`
            : ""
        }
        textoConfirmar={alvo ? TEXTOS[alvo.acao].botao : undefined}
        perigo={alvo ? TEXTOS[alvo.acao].perigo : false}
        ocupado={ocupado}
        onConfirmar={executar}
        onCancelar={() => setAlvo(null)}
      />
    </>
  );
}
