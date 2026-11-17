"use client";

import CadastroAdmin from "@/components/CadastroAdmin";
import { crud } from "@/services/crud";
import type { Bairro } from "@/types/imovel";

const api = crud<Bairro>("/bairros");

export default function BairrosAdmin() {
  return (
    <CadastroAdmin<Bairro>
      titulo="Bairros"
      nomeItem="bairro"
      campos={[
        { chave: "nome", rotulo: "Nome", obrigatorio: true },
        { chave: "cidade", rotulo: "Cidade", obrigatorio: true },
        { chave: "estado", rotulo: "Estado (UF)" },
        { chave: "cepInicial", rotulo: "CEP inicial" },
      ]}
      colunas={[
        { rotulo: "Nome", valor: (b) => b.nome },
        { rotulo: "Cidade", valor: (b) => b.cidade },
        { rotulo: "UF", valor: (b) => b.estado },
        { rotulo: "CEP inicial", valor: (b) => b.cepInicial },
      ]}
      listar={api.listar}
      criar={api.criar}
      atualizar={api.atualizar}
      excluir={api.excluir}
      paraForm={(b) => ({ nome: b.nome ?? "", cidade: b.cidade ?? "", estado: b.estado ?? "", cepInicial: b.cepInicial ?? "" })}
      descricaoItem={(b) => `o bairro "${b.nome}"`}
    />
  );
}
