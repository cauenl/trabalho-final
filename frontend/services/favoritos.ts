import { apiFetch } from "@/lib/api";
import type { ImovelResumo } from "@/types/imovel";

export const listarFavoritos = () => apiFetch<ImovelResumo[]>("/favoritos");
export const idsFavoritos = () => apiFetch<number[]>("/favoritos/ids");
export const favoritar = (imovelId: number) => apiFetch<void>(`/favoritos/${imovelId}`, { method: "POST" });
export const desfavoritar = (imovelId: number) => apiFetch<void>(`/favoritos/${imovelId}`, { method: "DELETE" });
