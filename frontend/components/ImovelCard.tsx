import type { Imovel } from "@/types/imovel";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function ImovelCard({ imovel }: { imovel: Imovel }) {
  const local = [imovel.bairro?.nome, imovel.bairro?.cidade].filter(Boolean).join(" - ");

  return (
    <article className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex h-40 items-center justify-center bg-gray-100 text-sm text-gray-400">
        Sem foto
      </div>

      <div className="space-y-1 p-4">
        <p className="text-xs font-semibold uppercase text-blue-700">
          {imovel.tipoImovel?.nome ?? "Imóvel"}
          {imovel.finalidade ? ` · ${imovel.finalidade}` : ""}
        </p>

        <h2 className="text-lg font-semibold text-gray-900">{imovel.titulo}</h2>

        {local && <p className="text-sm text-gray-600">{local}</p>}

        {imovel.precoVenda != null && (
          <p className="text-base font-bold text-gray-900">
            Venda: {moeda.format(imovel.precoVenda)}
          </p>
        )}
        {imovel.precoAluguel != null && (
          <p className="text-base font-bold text-gray-900">
            Aluguel: {moeda.format(imovel.precoAluguel)}
          </p>
        )}

        {imovel.status && (
          <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
            {imovel.status}
          </span>
        )}
      </div>
    </article>
  );
}
