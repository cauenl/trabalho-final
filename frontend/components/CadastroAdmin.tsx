"use client";

import { useState, type FormEvent, type ReactNode } from "react";

import Aviso, { type MensagemTela } from "@/components/ui/Aviso";
import Confirmacao from "@/components/ui/Confirmacao";
import Estado from "@/components/ui/Estado";
import { useDados } from "@/hooks/useDados";
import { ApiError } from "@/lib/api";

export interface Campo {
  chave: string;
  rotulo: string;
  tipo?: "text" | "number" | "textarea" | "select" | "checkbox" | "password";
  opcoes?: { valor: string; rotulo: string }[];
  obrigatorio?: boolean;
  dica?: string;
}

export interface Coluna<T> {
  rotulo: string;
  valor: (item: T) => ReactNode;
}

type Form = Record<string, string | boolean>;

interface Props<T extends { id: number }> {
  titulo: string;
  nomeItem: string; // "imóvel", "bairro"...
  campos: Campo[];
  colunas: Coluna<T>[];
  listar: () => Promise<T[]>;
  criar: (corpo: Form) => Promise<unknown>;
  atualizar: (id: number, corpo: Form) => Promise<unknown>;
  excluir: (id: number) => Promise<unknown>;
  paraForm: (item: T) => Form; // item da API -> valores do formulário
  descricaoItem: (item: T) => string; // texto usado na confirmação de exclusão
  podeExcluir?: (item: T) => boolean;
  formInicial?: Form;
  chaveLista?: string; // muda quando o filtro da listagem muda (recarrega)
  filtro?: ReactNode; // busca ou filtro exibido acima da tabela
}

// Tela de cadastro reutilizada pelos recursos do administrador (listar, criar, editar, excluir com confirmação).
export default function CadastroAdmin<T extends { id: number }>(p: Props<T>) {
  const { dados, carregando, erro, recarregar } = useDados(p.listar, p.chaveLista);
  const vazio: Form = p.formInicial ?? {};
  const [form, setForm] = useState<Form | null>(null); // null = formulário fechado
  const [editando, setEditando] = useState<number | null>(null);
  const [excluindo, setExcluindo] = useState<T | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState<MensagemTela | null>(null);
  const [erroForm, setErroForm] = useState<string | null>(null);

  function novo() {
    setEditando(null);
    setForm({ ...vazio });
    setErroForm(null);
  }

  function editar(item: T) {
    setEditando(item.id);
    setForm(p.paraForm(item));
    setErroForm(null);
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    for (const c of p.campos) {
      if (c.obrigatorio && !String(form[c.chave] ?? "").trim()) {
        setErroForm(`Preencha o campo "${c.rotulo}".`);
        return;
      }
    }
    setOcupado(true);
    setErroForm(null);
    try {
      if (editando == null) await p.criar(form);
      else await p.atualizar(editando, form);
      setMensagem({ tipo: "sucesso", texto: editando == null ? `Cadastrado: ${p.nomeItem}.` : `Alterado: ${p.nomeItem}.` });
      setForm(null);
      recarregar();
    } catch (err) {
      setErroForm(err instanceof ApiError ? err.message : "Erro inesperado.");
    } finally {
      setOcupado(false);
    }
  }

  async function confirmarExclusao() {
    if (!excluindo) return;
    setOcupado(true);
    try {
      await p.excluir(excluindo.id);
      setMensagem({ tipo: "sucesso", texto: `Excluído: ${p.nomeItem}.` });
      recarregar();
    } catch (err) {
      setMensagem({
        tipo: "erro",
        texto: err instanceof ApiError ? err.message : "Erro inesperado.",
      });
    } finally {
      setOcupado(false);
      setExcluindo(null);
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{p.titulo}</h1>
        <button onClick={novo} className="rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
          Novo {p.nomeItem}
        </button>
      </div>

      <Aviso mensagem={mensagem} />
      {p.filtro}

      {form && (
        <form onSubmit={salvar} className="mb-6 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="font-semibold text-gray-900">{editando == null ? `Novo ${p.nomeItem}` : `Editar ${p.nomeItem} nº ${editando}`}</h2>
          {erroForm && (
            <p role="alert" className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
              {erroForm}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {p.campos.map((c) => {
              const valor = form[c.chave] ?? (c.tipo === "checkbox" ? false : "");
              const mudar = (v: string | boolean) => setForm({ ...form, [c.chave]: v });
              const base = "mt-1 block w-full rounded border border-gray-300 p-2";
              return (
                <label key={c.chave} className={`block text-sm ${c.tipo === "textarea" ? "sm:col-span-2" : ""}`}>
                  {c.rotulo}
                  {c.obrigatorio && " *"}
                  {c.tipo === "textarea" ? (
                    <textarea value={String(valor)} onChange={(e) => mudar(e.target.value)} rows={3} className={base} />
                  ) : c.tipo === "select" ? (
                    <select value={String(valor)} onChange={(e) => mudar(e.target.value)} className={base}>
                      <option value="">Selecione...</option>
                      {c.opcoes?.map((o) => (
                        <option key={o.valor} value={o.valor}>
                          {o.rotulo}
                        </option>
                      ))}
                    </select>
                  ) : c.tipo === "checkbox" ? (
                    <input type="checkbox" checked={Boolean(valor)} onChange={(e) => mudar(e.target.checked)} className="ml-2" />
                  ) : (
                    <input
                      type={c.tipo === "number" ? "number" : c.tipo === "password" ? "password" : "text"}
                      step={c.tipo === "number" ? "any" : undefined}
                      value={String(valor)}
                      onChange={(e) => mudar(e.target.value)}
                      autoComplete={c.tipo === "password" ? "new-password" : undefined}
                      className={base}
                    />
                  )}
                  {c.dica && <span className="text-xs text-gray-500">{c.dica}</span>}
                </label>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button disabled={ocupado} className="rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
              {ocupado ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" onClick={() => setForm(null)} className="rounded border border-gray-300 px-4 py-2 text-sm">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <Estado carregando={carregando} erro={erro} aoTentarDeNovo={recarregar} vazio={dados?.length === 0} textoVazio={`Nenhum ${p.nomeItem} cadastrado.`}>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3">Nº</th>
                {p.colunas.map((c) => (
                  <th key={c.rotulo} className="p-3">
                    {c.rotulo}
                  </th>
                ))}
                <th className="p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {dados?.map((item) => (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="p-3">{item.id}</td>
                  {p.colunas.map((c) => (
                    <td key={c.rotulo} className="p-3">
                      {c.valor(item)}
                    </td>
                  ))}
                  <td className="space-x-3 p-3">
                    <button onClick={() => editar(item)} className="text-blue-800 hover:underline">
                      Editar
                    </button>
                    {(p.podeExcluir?.(item) ?? true) && (
                      <button onClick={() => setExcluindo(item)} className="text-red-700 hover:underline">
                        Excluir
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
        aberto={excluindo !== null}
        titulo={`Excluir ${p.nomeItem}`}
        mensagem={`Deseja excluir ${excluindo ? p.descricaoItem(excluindo) : ""}? Esta ação não pode ser desfeita.`}
        textoConfirmar="Excluir"
        perigo
        ocupado={ocupado}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setExcluindo(null)}
      />
    </>
  );
}
