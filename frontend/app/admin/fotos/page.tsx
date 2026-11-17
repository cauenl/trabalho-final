"use client";

import { useState, type ChangeEvent } from "react";

import Aviso, { type MensagemTela } from "@/components/ui/Aviso";
import Confirmacao from "@/components/ui/Confirmacao";
import Estado from "@/components/ui/Estado";
import { useDados } from "@/hooks/useDados";
import { ApiError } from "@/lib/api";
import { definirCapa, enviarFoto, excluirFoto, fotosDoImovel } from "@/services/fotos";
import { crud } from "@/services/crud";
import { urlFoto } from "@/services/imoveis";
import type { Foto, Imovel } from "@/types/imovel";

const imoveisApi = crud<Imovel>("/imoveis");

export default function FotosAdmin() {
  const [imovelId, setImovelId] = useState("");
  const imoveis = useDados(imoveisApi.listar);
  const fotos = useDados(() => (imovelId ? fotosDoImovel(Number(imovelId)) : Promise.resolve([] as Foto[])), imovelId);
  const [excluindo, setExcluindo] = useState<Foto | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState<MensagemTela | null>(null);

  async function executar(acao: () => Promise<unknown>, ok: string) {
    setOcupado(true);
    try {
      await acao();
      setMensagem({ tipo: "sucesso", texto: ok });
      fotos.recarregar();
    } catch (e) {
      setMensagem({ tipo: "erro", texto: e instanceof ApiError ? e.message : "Erro inesperado." });
    } finally {
      setOcupado(false);
    }
  }

  async function aoEscolher(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (arquivo && imovelId) await executar(() => enviarFoto(Number(imovelId), arquivo), "Foto enviada.");
  }

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Fotos dos imóveis</h1>
      <Aviso mensagem={mensagem} />

      <Estado carregando={imoveis.carregando} erro={imoveis.erro} aoTentarDeNovo={imoveis.recarregar}>
        <label className="mb-4 block text-sm">
          Imóvel
          <select value={imovelId} onChange={(e) => setImovelId(e.target.value)} className="mt-1 block w-full max-w-md rounded border border-gray-300 p-2">
            <option value="">Selecione...</option>
            {imoveis.dados?.map((i) => (
              <option key={i.id} value={i.id}>
                {i.id} - {i.titulo}
              </option>
            ))}
          </select>
        </label>
      </Estado>

      {imovelId && (
        <>
          <label className="mb-4 inline-block cursor-pointer rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
            {ocupado ? "Aguarde..." : "Enviar foto"}
            <input type="file" accept="image/*" onChange={aoEscolher} disabled={ocupado} className="hidden" />
          </label>

          <Estado carregando={fotos.carregando} erro={fotos.erro} aoTentarDeNovo={fotos.recarregar} vazio={fotos.dados?.length === 0} textoVazio="Este imóvel ainda não tem fotos.">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {fotos.dados?.map((f) => (
                <li key={f.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={urlFoto(f.id)} alt={f.nomeArquivo ?? "Foto"} className="h-36 w-full object-cover" />
                  <div className="space-y-1 p-2 text-sm">
                    {f.capa ? (
                      <p className="font-medium text-green-700">★ Capa</p>
                    ) : (
                      <button disabled={ocupado} onClick={() => executar(() => definirCapa(f.id), "Capa definida.")} className="text-blue-800 hover:underline">
                        Definir como capa
                      </button>
                    )}
                    <button onClick={() => setExcluindo(f)} className="block text-red-700 hover:underline">
                      Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Estado>
        </>
      )}

      <Confirmacao
        aberto={excluindo !== null}
        titulo="Excluir foto"
        mensagem="Deseja excluir esta foto? Esta ação não pode ser desfeita."
        textoConfirmar="Excluir"
        perigo
        ocupado={ocupado}
        onConfirmar={async () => {
          if (excluindo) await executar(() => excluirFoto(excluindo.id), "Foto excluída.");
          setExcluindo(null);
        }}
        onCancelar={() => setExcluindo(null)}
      />
    </>
  );
}
