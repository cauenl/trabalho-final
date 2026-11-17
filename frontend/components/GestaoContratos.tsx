"use client";

import { useState } from "react";

import Paginacao from "@/components/Paginacao";
import Aviso, { type MensagemTela } from "@/components/ui/Aviso";
import Confirmacao from "@/components/ui/Confirmacao";
import Estado from "@/components/ui/Estado";
import StatusBadge from "@/components/ui/StatusBadge";
import { useDados } from "@/hooks/useDados";
import { usePagina } from "@/hooks/usePagina";
import { useSessao } from "@/hooks/useSessao";
import { ApiError } from "@/lib/api";
import { formatarData, formatarMoeda, ROTULO_TIPO_OFERTA } from "@/lib/formatar";
import { aprovarContrato, baixarContrato, cancelarContrato, listarContratos, recusarContrato } from "@/services/contratos";
import type { Contrato } from "@/types/negocio";

type Acao = "aprovar" | "recusar" | "cancelar";

const TEXTOS: Record<Acao, { titulo: string; botao: string; perigo: boolean; detalhe: string }> = {
  aprovar: { titulo: "Aprovar contrato", botao: "Aprovar", perigo: false, detalhe: "Ele será enviado ao cliente (PDF por e-mail) para assinatura." },
  recusar: { titulo: "Recusar rascunho", botao: "Recusar", perigo: true, detalhe: "O corretor poderá preparar outro contrato." },
  cancelar: { titulo: "Cancelar contrato", botao: "Cancelar contrato", perigo: true, detalhe: "Use quando o cliente desistir: a oferta aceita é cancelada, o imóvel volta a ficar disponível e as ofertas em espera voltam a pendentes." },
};

// Contratos para equipe: corretor acompanha; só o administrador aprova, recusa ou cancela.
export default function GestaoContratos() {
  const { sessao } = useSessao();
  const admin = sessao?.tipo === "ADMIN";
  const { dados, carregando, erro, recarregar } = useDados(listarContratos);
  const pag = usePagina(dados);
  const [alvo, setAlvo] = useState<{ contrato: Contrato; acao: Acao } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState<MensagemTela | null>(null);

  async function executar() {
    if (!alvo) return;
    setOcupado(true);
    try {
      const { contrato, acao } = alvo;
      if (acao === "aprovar") {
        const r = await aprovarContrato(contrato.id);
        setMensagem(
          r.notificacaoEnviada === false
            ? { tipo: "sucesso", texto: "Contrato aprovado, mas o e-mail ao cliente não pôde ser enviado (o cliente ainda o vê na área dele)." }
            : { tipo: "sucesso", texto: "Contrato aprovado e enviado ao cliente." },
        );
      } else {
        if (acao === "recusar") await recusarContrato(contrato.id);
        else await cancelarContrato(contrato.id);
        setMensagem({ tipo: "sucesso", texto: acao === "recusar" ? "Rascunho recusado." : "Contrato cancelado." });
      }
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
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Contratos</h1>
      <Aviso mensagem={mensagem} />

      <Estado carregando={carregando} erro={erro} aoTentarDeNovo={recarregar} vazio={dados?.length === 0} textoVazio="Nenhum contrato ainda.">
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3">Nº</th>
                <th className="p-3">Imóvel</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Valor</th>
                <th className="p-3">Situação</th>
                <th className="p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pag.itensDaPagina?.map((c) => (
                <tr key={c.id} className="border-t border-gray-100 align-top">
                  <td className="p-3">{c.id}</td>
                  <td className="p-3">{c.imovelTitulo}</td>
                  <td className="p-3">
                    {c.clienteNome}
                    <p className="text-xs text-gray-500">{c.clienteEmail}</p>
                  </td>
                  <td className="p-3">{ROTULO_TIPO_OFERTA[c.tipo]}</td>
                  <td className="p-3">{formatarMoeda(c.valor)}</td>
                  <td className="p-3">
                    <StatusBadge status={c.status} />
                    {c.dataAssinatura && <p className="mt-1 text-xs text-gray-500">assinado em {formatarData(c.dataAssinatura)}</p>}
                    {c.preparadoPor && <p className="mt-1 text-xs text-gray-500">preparado por {c.preparadoPor}</p>}
                  </td>
                  <td className="space-x-3 p-3">
                    <button onClick={() => baixar(c)} className="text-blue-800 hover:underline">
                      PDF
                    </button>
                    {admin && c.status === "AGUARDANDO_APROVACAO" && (
                      <>
                        <button onClick={() => setAlvo({ contrato: c, acao: "aprovar" })} className="text-green-700 hover:underline">
                          Aprovar
                        </button>
                        <button onClick={() => setAlvo({ contrato: c, acao: "recusar" })} className="text-red-700 hover:underline">
                          Recusar
                        </button>
                      </>
                    )}
                    {admin && (c.status === "AGUARDANDO_APROVACAO" || c.status === "AGUARDANDO_ASSINATURA") && (
                      <button onClick={() => setAlvo({ contrato: c, acao: "cancelar" })} className="text-red-700 hover:underline">
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Paginacao pagina={pag.pagina} totalPaginas={pag.totalPaginas} onMudar={pag.mudar} />
        <p className="mt-2 text-center text-xs text-gray-500">{pag.total} contrato(s)</p>
      </Estado>

      <Confirmacao
        aberto={alvo !== null}
        titulo={alvo ? TEXTOS[alvo.acao].titulo : ""}
        mensagem={alvo ? `Contrato nº ${alvo.contrato.id} (${alvo.contrato.imovelTitulo}). ${TEXTOS[alvo.acao].detalhe}` : ""}
        textoConfirmar={alvo ? TEXTOS[alvo.acao].botao : undefined}
        perigo={alvo ? TEXTOS[alvo.acao].perigo : false}
        ocupado={ocupado}
        onConfirmar={executar}
        onCancelar={() => setAlvo(null)}
      />
    </>
  );
}
