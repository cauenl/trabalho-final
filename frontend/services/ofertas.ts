import { apiFetch } from "@/lib/api";
import type { Oferta, TipoOferta } from "@/types/negocio";

export interface NovaOferta {
  imovelId: number;
  tipo: TipoOferta;
  valor: number;
  mensagem: string;
}

export const criarOferta = (dados: NovaOferta) => apiFetch<Oferta>("/ofertas", { method: "POST", body: dados });

// cliente
export const minhasOfertas = () => apiFetch<Oferta[]>("/ofertas/minhas");
export const cancelarOferta = (id: number) => apiFetch<Oferta>(`/ofertas/${id}/cancelar`, { method: "PATCH" });

// corretor e admin
export const listarOfertas = (status = "") => apiFetch<Oferta[]>(`/ofertas${status ? `?status=${status}` : ""}`);
export const aceitarOferta = (id: number) => apiFetch<Oferta>(`/ofertas/${id}/aceitar`, { method: "PATCH" });
export const recusarOferta = (id: number) => apiFetch<Oferta>(`/ofertas/${id}/recusar`, { method: "PATCH" });
