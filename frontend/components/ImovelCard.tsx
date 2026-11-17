import Link from "next/link";

import FavoritoBotao from "@/components/FavoritoBotao";
import { formatarMoeda } from "@/lib/formatar";
import { urlFoto } from "@/services/imoveis";
import type { ImovelResumo } from "@/types/imovel";

export default function ImovelCard({
  imovel,
  aoAlterarFavorito,
}: {
  imovel: ImovelResumo;
  aoAlterarFavorito?: () => void;
}) {
  const local = [imovel.bairro, imovel.cidade].filter(Boolean).join(" - ");

  return (
    <div className="relative">
      <Link
        href={`/imoveis/${imovel.id}`}
        className="block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
      >
        {imovel.fotoCapaId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={urlFoto(imovel.fotoCapaId)}
            alt={imovel.titulo}
            className="h-44 w-full object-cover"
          />
        ) : (
          <div className="flex h-44 items-center justify-center bg-gray-100 text-sm text-gray-400">
            Sem foto
          </div>
        )}

        <div className="space-y-1 p-4">
          <p className="text-xs font-semibold uppercase text-blue-700">{imovel.tipo ?? "Imóvel"}</p>
          <h2 className="text-lg font-semibold text-gray-900">{imovel.titulo}</h2>
          {local && <p className="text-sm text-gray-600">{local}</p>}

          {imovel.precoVenda != null && (
            <p className="font-bold text-gray-900">Venda: {formatarMoeda(imovel.precoVenda)}</p>
          )}
          {imovel.precoAluguel != null && (
            <p className="font-bold text-gray-900">Aluguel: {formatarMoeda(imovel.precoAluguel)}</p>
          )}
        </div>
      </Link>

      {/* o coração fica fora do link, no canto da foto (só aparece para o cliente logado) */}
      <div className="absolute right-2 top-2">
        <FavoritoBotao imovelId={imovel.id} aoAlterar={aoAlterarFavorito} />
      </div>
    </div>
  );
}
