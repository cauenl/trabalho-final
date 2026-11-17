const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatarMoeda(valor: number | null | undefined): string {
  return valor == null ? "" : moeda.format(valor);
}

export function formatarData(iso: string | null | undefined): string {
  if (!iso) return "";
  const data = new Date(iso);
  return Number.isNaN(data.getTime()) ? "" : data.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export const ROTULO_TIPO_OFERTA = { VENDA: "Compra", ALUGUEL: "Aluguel" } as const;
