export interface PayloadJwt {
  sub?: string;
  tipo?: string;
  id?: number;
  exp?: number;
}

// lê o payload do token (só leitura: não valida a assinatura, quem valida é o backend)
export function decodificarJwt(token: string): PayloadJwt | null {
  try {
    const parte = token.split(".")[1];
    if (!parte) return null;
    const base64 = parte.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
    return JSON.parse(json) as PayloadJwt;
  } catch {
    return null;
  }
}
