export type TipoOferta = "VENDA" | "ALUGUEL";
export type StatusOferta = "PENDENTE" | "ACEITA" | "EM_ESPERA" | "RECUSADA" | "CANCELADA";
export type StatusContrato = "AGUARDANDO_APROVACAO" | "AGUARDANDO_ASSINATURA" | "ASSINADO" | "CANCELADO";

export interface Oferta {
  id: number;
  imovelId: number;
  imovelTitulo: string;
  imovelStatus: string | null;
  bairro: string | null;
  usuarioId: number;
  usuarioNome: string;
  usuarioEmail: string;
  tipo: TipoOferta;
  valorProposto: number;
  mensagem: string | null;
  status: StatusOferta;
  criadoEm: string;
  contratoId: number | null;
  contratoStatus: StatusContrato | null;
}

export interface Contrato {
  id: number;
  ofertaId: number;
  imovelId: number;
  imovelTitulo: string;
  clienteId: number;
  clienteNome: string;
  clienteEmail: string;
  tipo: TipoOferta;
  valor: number;
  status: StatusContrato;
  criadoEm: string;
  dataAprovacao: string | null;
  dataAssinatura: string | null;
  preparadoPor: string | null;
  notificacaoEnviada: boolean | null;
}

export interface ItemGrafico {
  rotulo: string;
  total: number;
}

export interface Painel {
  imoveisDisponiveis: number;
  ofertasPendentes: number;
  contratosAguardandoAssinatura: number;
  imoveisPorBairro: ItemGrafico[];
  ofertasPorSituacao: ItemGrafico[];
  imoveisPorFinalidade: ItemGrafico[];
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: string;
}
