"use client";

import CadastroAdmin from "@/components/CadastroAdmin";
import Estado from "@/components/ui/Estado";
import StatusBadge from "@/components/ui/StatusBadge";
import { useDados } from "@/hooks/useDados";
import { formatarMoeda } from "@/lib/formatar";
import { listarBairros } from "@/services/bairros";
import { crud } from "@/services/crud";
import type { Imovel, TipoImovel } from "@/types/imovel";

const api = crud<Imovel>("/imoveis");
const tiposApi = crud<TipoImovel>("/tipos-imoveis");

const num = (v: string | boolean | undefined) => (v === undefined || v === "" ? null : Number(v));
const txt = (v: string | boolean | undefined) => (v === undefined || v === "" ? null : String(v));

export default function ImoveisAdmin() {
  const { dados, carregando, erro, recarregar } = useDados(async () => {
    const [bairros, tipos] = await Promise.all([listarBairros(), tiposApi.listar()]);
    return { bairros, tipos };
  });

  return (
    <Estado carregando={carregando} erro={erro} aoTentarDeNovo={recarregar}>
      <CadastroAdmin<Imovel>
        titulo="Imóveis"
        nomeItem="imóvel"
        formInicial={{ status: "Disponível", destaque: false }}
        campos={[
          { chave: "titulo", rotulo: "Título", obrigatorio: true },
          {
            chave: "tipoImovelId",
            rotulo: "Tipo",
            tipo: "select",
            obrigatorio: true,
            opcoes: dados?.tipos.map((t) => ({ valor: String(t.id), rotulo: t.nome ?? "" })),
          },
          {
            chave: "bairroId",
            rotulo: "Bairro",
            tipo: "select",
            obrigatorio: true,
            opcoes: dados?.bairros.map((b) => ({ valor: String(b.id), rotulo: `${b.nome} - ${b.cidade}` })),
          },
          { chave: "precoVenda", rotulo: "Preço de venda (R$)", tipo: "number", dica: "Deixe vazio se não for vendido." },
          { chave: "precoAluguel", rotulo: "Preço de aluguel (R$)", tipo: "number", dica: "Deixe vazio se não for alugado." },
          {
            chave: "status",
            rotulo: "Situação",
            tipo: "select",
            opcoes: ["Disponível", "Reservado", "Alugado", "Vendido"].map((s) => ({ valor: s, rotulo: s })),
          },
          { chave: "dormitorios", rotulo: "Dormitórios", tipo: "number" },
          { chave: "banheiros", rotulo: "Banheiros", tipo: "number" },
          { chave: "garagem", rotulo: "Vagas de garagem", tipo: "number" },
          { chave: "areaTotal", rotulo: "Área total (m²)", tipo: "number" },
          { chave: "areaConstruida", rotulo: "Área construída (m²)", tipo: "number" },
          { chave: "endereco", rotulo: "Endereço" },
          { chave: "numero", rotulo: "Número" },
          { chave: "cep", rotulo: "CEP" },
          { chave: "descricao", rotulo: "Descrição", tipo: "textarea" },
          { chave: "caracteristicas", rotulo: "Características", tipo: "textarea" },
          { chave: "destaque", rotulo: "Destaque", tipo: "checkbox" },
        ]}
        colunas={[
          { rotulo: "Título", valor: (i) => i.titulo },
          { rotulo: "Tipo", valor: (i) => i.tipoImovel?.nome },
          { rotulo: "Bairro", valor: (i) => i.bairro?.nome },
          { rotulo: "Venda", valor: (i) => formatarMoeda(i.precoVenda) },
          { rotulo: "Aluguel", valor: (i) => formatarMoeda(i.precoAluguel) },
          { rotulo: "Situação", valor: (i) => (i.status ? <StatusBadge status={i.status} /> : null) },
        ]}
        listar={api.listar}
        criar={(f) => api.criar(paraCorpo(f))}
        atualizar={(id, f) => api.atualizar(id, paraCorpo(f))}
        excluir={api.excluir}
        paraForm={(i) => ({
          titulo: i.titulo ?? "",
          tipoImovelId: i.tipoImovel ? String(i.tipoImovel.id) : "",
          bairroId: i.bairro ? String(i.bairro.id) : "",
          precoVenda: i.precoVenda != null ? String(i.precoVenda) : "",
          precoAluguel: i.precoAluguel != null ? String(i.precoAluguel) : "",
          status: i.status ?? "Disponível",
          dormitorios: i.dormitorios != null ? String(i.dormitorios) : "",
          banheiros: i.banheiros != null ? String(i.banheiros) : "",
          garagem: i.garagem != null ? String(i.garagem) : "",
          areaTotal: i.areaTotal != null ? String(i.areaTotal) : "",
          areaConstruida: i.areaConstruida != null ? String(i.areaConstruida) : "",
          endereco: i.endereco ?? "",
          numero: i.numero ?? "",
          cep: i.cep ?? "",
          descricao: i.descricao ?? "",
          caracteristicas: i.caracteristicas ?? "",
          destaque: Boolean(i.destaque),
        })}
        descricaoItem={(i) => `o imóvel "${i.titulo}"`}
      />
    </Estado>
  );
}

function paraCorpo(f: Record<string, string | boolean>) {
  const venda = num(f.precoVenda);
  const aluguel = num(f.precoAluguel);
  return {
    titulo: txt(f.titulo),
    descricao: txt(f.descricao),
    caracteristicas: txt(f.caracteristicas),
    precoVenda: venda,
    precoAluguel: aluguel,
    finalidade: venda != null && aluguel != null ? "VENDA/ALUGUEL" : aluguel != null ? "ALUGUEL" : "VENDA",
    status: txt(f.status) ?? "Disponível",
    dormitorios: num(f.dormitorios),
    banheiros: num(f.banheiros),
    garagem: num(f.garagem),
    areaTotal: num(f.areaTotal),
    areaConstruida: num(f.areaConstruida),
    endereco: txt(f.endereco),
    numero: txt(f.numero),
    cep: txt(f.cep),
    destaque: Boolean(f.destaque),
    tipoImovel: { id: Number(f.tipoImovelId) },
    bairro: { id: Number(f.bairroId) },
  };
}
