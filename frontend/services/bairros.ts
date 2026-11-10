import { apiFetch } from "@/lib/api";
import type { Bairro } from "@/types/imovel";

export function listarBairros(): Promise<Bairro[]> {
  return apiFetch<Bairro[]>("/bairros");
}
