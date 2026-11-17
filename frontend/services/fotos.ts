import { apiFetch } from "@/lib/api";
import type { Foto } from "@/types/imovel";

export const fotosDoImovel = (imovelId: number) => apiFetch<Foto[]>(`/fotos/imovel/${imovelId}`);

export function enviarFoto(imovelId: number, arquivo: File) {
  const form = new FormData();
  form.append("imovelId", String(imovelId));
  form.append("arquivo", arquivo);
  return apiFetch<Foto>("/fotos", { method: "POST", body: form });
}

// troca a ordem e/ou a imagem
export function atualizarFoto(id: number, dados: { ordem?: number; arquivo?: File }) {
  const form = new FormData();
  if (dados.ordem !== undefined) form.append("ordem", String(dados.ordem));
  if (dados.arquivo) form.append("arquivo", dados.arquivo);
  return apiFetch<Foto>(`/fotos/${id}`, { method: "PUT", body: form });
}

export const definirCapa = (id: number) => apiFetch<Foto>(`/fotos/${id}/capa`, { method: "PATCH" });
export const excluirFoto = (id: number) => apiFetch<void>(`/fotos/${id}`, { method: "DELETE" });
