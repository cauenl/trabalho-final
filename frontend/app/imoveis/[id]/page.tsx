import { Suspense } from "react";

import DetalheImovel from "@/components/DetalheImovel";

export default function Page({ params }: PageProps<"/imoveis/[id]">) {
  return (
    <Suspense fallback={<p className="p-8 text-gray-600">Carregando imóvel...</p>}>
      <Conteudo params={params} />
    </Suspense>
  );
}

// no Next 16 com cacheComponents, ler `params` precisa ficar dentro de um <Suspense>
async function Conteudo({ params }: { params: PageProps<"/imoveis/[id]">["params"] }) {
  const { id } = await params;
  return <DetalheImovel id={Number(id)} />;
}
