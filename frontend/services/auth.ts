import { apiFetch, ApiError } from "@/lib/api";
import { salvarSessao, type Perfil, type Sessao } from "@/lib/auth";

interface RespostaLogin {
  token: string;
  tipo: Perfil;
  expiraEmSegundos: number;
}

export async function entrar(email: string, password: string): Promise<Sessao> {
  const resposta = await apiFetch<RespostaLogin>("/public/login", {
    method: "POST",
    body: { email, password },
    token: null,
  });

  const sessao = salvarSessao(resposta.token);
  if (!sessao) {
    throw new ApiError(500, "Resposta de login inválida. Tente novamente.");
  }
  return sessao;
}
