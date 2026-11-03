const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// só aproveita o corpo da resposta se for texto simples (nunca mostra JSON ao usuário)
function textoSimples(corpo: string): string {
  const texto = corpo.trim();
  if (!texto || texto.startsWith("{") || texto.startsWith("[")) {
    return "";
  }
  return texto;
}

function mensagemPorStatus(status: number, corpo: string): string {
  switch (status) {
    case 400:
      return corpo || "Dados inválidos. Confira os campos e tente novamente.";
    case 401:
      return "Sua sessão expirou ou as credenciais são inválidas. Faça login novamente.";
    case 403:
      return "Acesso negado. Você não tem permissão para esta ação.";
    case 404:
      return "Item não encontrado.";
    case 409:
      return corpo || "A operação não pôde ser concluída por causa de uma regra do sistema.";
    default:
      return status >= 500
        ? "O servidor encontrou um problema. Tente novamente em instantes."
        : "Não foi possível concluir a operação.";
  }
}

type Opcoes = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};

export async function apiFetch<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const { body, token, headers, ...resto } = opcoes;

  const cabecalhos = new Headers(headers);
  if (body !== undefined && !(body instanceof FormData)) {
    cabecalhos.set("Content-Type", "application/json");
  }
  if (token) {
    cabecalhos.set("Authorization", `Bearer ${token}`);
  }

  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      ...resto,
      headers: cabecalhos,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Não foi possível conectar ao servidor. Verifique se o backend está no ar.");
  }

  if (!resposta.ok) {
    const corpo = await resposta.text().catch(() => "");
    throw new ApiError(resposta.status, mensagemPorStatus(resposta.status, textoSimples(corpo)));
  }

  if (resposta.status === 204) {
    return undefined as T;
  }

  const texto = await resposta.text();
  return (texto ? JSON.parse(texto) : undefined) as T;
}
