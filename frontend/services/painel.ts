import { apiFetch } from "@/lib/api";
import type { Painel } from "@/types/negocio";

export const carregarPainel = () => apiFetch<Painel>("/painel/resumo");
