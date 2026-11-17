import { apiFetch } from "@/lib/api";
import type { Usuario } from "@/types/negocio";

export interface DadosUsuario {
  nome: string;
  email: string;
  tipo: string;
  senha?: string;
}

export const listarUsuarios = (busca = "") =>
  apiFetch<Usuario[]>(`/users${busca.trim() ? `?busca=${encodeURIComponent(busca.trim())}` : ""}`);
export const criarUsuario = (dados: DadosUsuario) => apiFetch<void>("/users", { method: "POST", body: dados });
export const atualizarUsuario = (id: number, dados: DadosUsuario) =>
  apiFetch<void>(`/users/${id}`, { method: "PUT", body: dados });
export const alterarPerfil = (id: number, tipo: string) =>
  apiFetch<Usuario>(`/users/${id}/tipo`, { method: "PATCH", body: { tipo } });
export const excluirUsuario = (id: number) => apiFetch<void>(`/users/${id}`, { method: "DELETE" });
