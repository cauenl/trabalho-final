import { decodificarJwt } from "@/lib/jwt";

export type Perfil = "ADMIN" | "USER";

export interface Sessao {
  token: string;
  tipo: Perfil;
  email: string;
  expiraEm: number; // milissegundos
}

const CHAVE = "imobiliaria.sessao";
const AVISO = "imobiliaria.aviso-login";

const ouvintes = new Set<() => void>();
let cacheBruto: string | null | undefined;
let cacheSessao: Sessao | null = null;

function avisar() {
  ouvintes.forEach((f) => f());
}

function ler(bruto: string | null): Sessao | null {
  if (!bruto) return null;
  try {
    const s = JSON.parse(bruto) as Sessao;
    if (!s.token || !s.tipo || s.expiraEm <= Date.now()) return null;
    return s;
  } catch {
    return null;
  }
}

export function obterSessao(): Sessao | null {
  if (typeof window === "undefined") return null;
  const bruto = window.localStorage.getItem(CHAVE);
  if (bruto !== cacheBruto) {
    cacheBruto = bruto;
    cacheSessao = ler(bruto);
  }
  return cacheSessao;
}

export function salvarSessao(token: string): Sessao | null {
  const p = decodificarJwt(token);
  if (!p?.sub || !p.exp || (p.tipo !== "ADMIN" && p.tipo !== "USER")) return null;
  const sessao: Sessao = { token, tipo: p.tipo, email: p.sub, expiraEm: p.exp * 1000 };
  window.localStorage.setItem(CHAVE, JSON.stringify(sessao));
  avisar();
  return sessao;
}

// apaga o token; o aviso (opcional) aparece na tela de login
export function encerrarSessao(aviso?: string) {
  window.localStorage.removeItem(CHAVE);
  if (aviso) window.sessionStorage.setItem(AVISO, aviso);
  avisar();
}

export function obterAviso(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(AVISO);
}

export function limparAviso() {
  window.sessionStorage.removeItem(AVISO);
  avisar();
}

export function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  const aoMudarStorage = (e: StorageEvent) => {
    if (e.key === CHAVE) ouvinte();
  };
  window.addEventListener("storage", aoMudarStorage);
  return () => {
    ouvintes.delete(ouvinte);
    window.removeEventListener("storage", aoMudarStorage);
  };
}

export function areaInicial(tipo: Perfil): string {
  return tipo === "ADMIN" ? "/admin" : "/cliente";
}
