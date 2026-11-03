export interface Bairro {
  id: number;
  nome: string | null;
  cidade: string | null;
  estado: string | null;
  cepInicial: string | null;
}

export interface TipoImovel {
  id: number;
  nome: string | null;
  descricao: string | null;
}

export interface Imovel {
  id: number;
  titulo: string;
  descricao: string | null;
  precoVenda: number | null;
  precoAluguel: number | null;
  finalidade: string | null;
  status: string | null;
  dormitorios: number | null;
  banheiros: number | null;
  garagem: number | null;
  areaTotal: number | null;
  areaConstruida: number | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  cep: string | null;
  caracteristicas: string | null;
  destaque: boolean | null;
  tipoImovel: TipoImovel | null;
  bairro: Bairro | null;
}
