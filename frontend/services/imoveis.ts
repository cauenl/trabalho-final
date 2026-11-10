import { API_URL, apiFetch } from "@/lib/api";
import type { Foto, Imovel, ImovelResumo, Pagina } from "@/types/imovel";

export interface FiltrosBusca {
  bairroId: string;
  finalidade: string; // "", "VENDA" ou "ALUGUEL"
  precoMin: string;
  precoMax: string;
  ordem: string; // "recentes", "preco_asc" ou "preco_desc"
  pagina: number; // começa em 0
}

export const FILTROS_INICIAIS: FiltrosBusca = {
  bairroId: "",
  finalidade: "",
  precoMin: "",
  precoMax: "",
  ordem: "recentes",
  pagina: 0,
};

export function buscarVitrine(f: FiltrosBusca): Promise<Pagina<ImovelResumo>> {
  const params = new URLSearchParams();
  if (f.bairroId) params.set("bairroId", f.bairroId);
  if (f.finalidade) params.set("finalidade", f.finalidade);
  if (f.precoMin) params.set("precoMin", f.precoMin);
  if (f.precoMax) params.set("precoMax", f.precoMax);
  params.set("ordem", f.ordem);
  params.set("pagina", String(f.pagina));
  params.set("tamanho", "9");
  return apiFetch<Pagina<ImovelResumo>>(`/imoveis/vitrine?${params.toString()}`);
}

export function buscarImovel(id: number): Promise<Imovel> {
  return apiFetch<Imovel>(`/imoveis/${id}`);
}

export function listarFotos(imovelId: number): Promise<Foto[]> {
  return apiFetch<Foto[]>(`/fotos/imovel/${imovelId}`);
}

export function urlFoto(fotoId: number): string {
  return `${API_URL}/fotos/${fotoId}/arquivo`;
}
