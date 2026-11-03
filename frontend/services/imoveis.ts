import { apiFetch } from "@/lib/api";
import type { Imovel } from "@/types/imovel";

export function listarImoveis(): Promise<Imovel[]> {
  return apiFetch<Imovel[]>("/imoveis");
}
