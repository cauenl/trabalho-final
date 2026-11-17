export interface MensagemTela {
  tipo: "sucesso" | "erro";
  texto: string;
}

// Faixa de resultado de uma ação (sucesso ou erro amigável).
export default function Aviso({ mensagem }: { mensagem: MensagemTela | null }) {
  if (!mensagem) return null;
  const sucesso = mensagem.tipo === "sucesso";
  return (
    <p
      role={sucesso ? "status" : "alert"}
      className={`mb-4 rounded border p-3 text-sm ${
        sucesso ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {mensagem.texto}
    </p>
  );
}
