import { apiBlob, apiFetch } from "@/lib/api";
import type { Contrato } from "@/types/negocio";

export const meusContratos = () => apiFetch<Contrato[]>("/contratos/meus");
export const assinarContrato = (id: number) => apiFetch<Contrato>(`/contratos/${id}/assinar`, { method: "POST" });

// corretor e admin
export const listarContratos = () => apiFetch<Contrato[]>("/contratos");
export const prepararContrato = (ofertaId: number) =>
  apiFetch<Contrato>("/contratos", { method: "POST", body: { ofertaId } });

// só admin
export const aprovarContrato = (id: number) => apiFetch<Contrato>(`/contratos/${id}/aprovar`, { method: "PATCH" });
export const recusarContrato = (id: number) => apiFetch<Contrato>(`/contratos/${id}/recusar`, { method: "PATCH" });
export const cancelarContrato = (id: number) => apiFetch<Contrato>(`/contratos/${id}/cancelar`, { method: "PATCH" });

// baixa o PDF (precisa do token, então vai por fetch e vira um download)
export async function baixarContrato(id: number): Promise<void> {
  const arquivo = await apiBlob(`/contratos/${id}/pdf`);
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = `contrato-${id}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
