"use client";

import CadastroAdmin from "@/components/CadastroAdmin";
import { crud } from "@/services/crud";
import type { TipoImovel } from "@/types/imovel";

const api = crud<TipoImovel>("/tipos-imoveis");

export default function TiposAdmin() {
  return (
    <CadastroAdmin<TipoImovel>
      titulo="Tipos de imóvel"
      nomeItem="tipo"
      campos={[
        { chave: "nome", rotulo: "Nome", obrigatorio: true },
        { chave: "descricao", rotulo: "Descrição", tipo: "textarea" },
      ]}
      colunas={[
        { rotulo: "Nome", valor: (t) => t.nome },
        { rotulo: "Descrição", valor: (t) => t.descricao },
      ]}
      listar={api.listar}
      criar={api.criar}
      atualizar={api.atualizar}
      excluir={api.excluir}
      paraForm={(t) => ({ nome: t.nome ?? "", descricao: t.descricao ?? "" })}
      descricaoItem={(t) => `o tipo "${t.nome}"`}
    />
  );
}
