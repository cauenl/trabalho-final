import { apiFetch } from "@/lib/api";

// operações de cadastro padrão (listar, criar, editar e excluir) de um recurso da API
export function crud<T>(base: string) {
  return {
    listar: () => apiFetch<T[]>(base),
    criar: (corpo: unknown) => apiFetch<void>(base, { method: "POST", body: corpo }),
    atualizar: (id: number, corpo: unknown) => apiFetch<void>(`${base}/${id}`, { method: "PUT", body: corpo }),
    excluir: (id: number) => apiFetch<void>(`${base}/${id}`, { method: "DELETE" }),
  };
}
