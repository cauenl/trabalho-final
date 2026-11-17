"use client";

import { useState } from "react";

import CadastroAdmin from "@/components/CadastroAdmin";
import { useSessao } from "@/hooks/useSessao";
import { ROTULO_PERFIL, type Perfil } from "@/lib/auth";
import { atualizarUsuario, criarUsuario, excluirUsuario, listarUsuarios, type DadosUsuario } from "@/services/usuarios";
import type { Usuario } from "@/types/negocio";

const OPCOES = (Object.keys(ROTULO_PERFIL) as Perfil[]).map((p) => ({ valor: p, rotulo: ROTULO_PERFIL[p] }));

const paraCorpo = (f: Record<string, string | boolean>): DadosUsuario => ({
  nome: String(f.nome ?? "").trim(),
  email: String(f.email ?? "").trim(),
  tipo: String(f.tipo ?? "USER"),
  senha: String(f.senha ?? ""),
});

export default function UsuariosAdmin() {
  const { sessao } = useSessao();
  const [busca, setBusca] = useState("");

  return (
    <CadastroAdmin<Usuario>
      titulo="Usuários"
      nomeItem="usuário"
      formInicial={{ tipo: "USER" }}
      chaveLista={busca}
      filtro={
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou e-mail"
          aria-label="Buscar usuário"
          className="mb-4 w-full max-w-sm rounded border border-gray-300 p-2 text-sm"
        />
      }
      campos={[
        { chave: "nome", rotulo: "Nome", obrigatorio: true },
        { chave: "email", rotulo: "E-mail", obrigatorio: true },
        { chave: "tipo", rotulo: "Perfil", tipo: "select", obrigatorio: true, opcoes: OPCOES },
        { chave: "senha", rotulo: "Senha", tipo: "password", dica: "Ao editar, deixe vazio para manter a senha atual." },
      ]}
      colunas={[
        { rotulo: "Nome", valor: (u) => u.nome },
        { rotulo: "E-mail", valor: (u) => u.email },
        { rotulo: "Perfil", valor: (u) => ROTULO_PERFIL[u.tipo as Perfil] ?? u.tipo },
      ]}
      listar={() => listarUsuarios(busca)}
      criar={(f) => criarUsuario(paraCorpo(f))}
      atualizar={(id, f) => atualizarUsuario(id, paraCorpo(f))}
      excluir={excluirUsuario}
      paraForm={(u) => ({ nome: u.nome, email: u.email, tipo: u.tipo, senha: "" })}
      descricaoItem={(u) => `o usuário "${u.nome}"`}
      podeExcluir={(u) => u.id !== sessao?.id}
    />
  );
}
