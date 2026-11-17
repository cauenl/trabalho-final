const ROTULOS: Record<string, string> = {
  PENDENTE: "Pendente",
  ACEITA: "Aceita",
  EM_ESPERA: "Em espera",
  RECUSADA: "Recusada",
  CANCELADA: "Cancelada",
  AGUARDANDO_APROVACAO: "Aguardando aprovação",
  AGUARDANDO_ASSINATURA: "Aguardando assinatura",
  ASSINADO: "Assinado",
  CANCELADO: "Cancelado",
};

const CORES: Record<string, string> = {
  PENDENTE: "bg-amber-100 text-amber-800",
  ACEITA: "bg-green-100 text-green-800",
  EM_ESPERA: "bg-sky-100 text-sky-800",
  RECUSADA: "bg-red-100 text-red-800",
  CANCELADA: "bg-gray-200 text-gray-700",
  AGUARDANDO_APROVACAO: "bg-amber-100 text-amber-800",
  AGUARDANDO_ASSINATURA: "bg-blue-100 text-blue-800",
  ASSINADO: "bg-green-100 text-green-800",
  CANCELADO: "bg-gray-200 text-gray-700",
};

// selo colorido para as situações de oferta, contrato e imóvel
export default function StatusBadge({ status }: { status: string | null }) {
  if (!status) return null;
  const texto = ROTULOS[status] ?? status;
  const cor = CORES[status] ?? (status.toLowerCase().startsWith("dispon") ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700");
  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${cor}`}>{texto}</span>;
}
