# Trabalho Final: Imobiliária

Trabalho final de **Programação Web IV** (IFFar, Campus Panambi).
Sistema de uma imobiliária: **API REST (Spring Boot)** + **front-end (React + Next.js)** + **banco de dados MySQL**.

Aluno: Cauê Nunes de Lima &nbsp;·&nbsp; Tecnologia sorteada: **React + Next**

## Estrutura do repositório

```
trabalho-final/
├── backend/            API REST em Spring Boot (JWT, imóveis, bairros, tipos, fotos, usuários)
│   └── database/       scripts SQL: schema.sql e dados-exemplo.sql
├── frontend/           Front-end em React + Next.js (App Router, TypeScript, Tailwind)
└── README.md           este arquivo
```

## Pré-requisitos

- **JDK 17** ou superior
- **Node.js 20** ou superior
- **MySQL / MariaDB** em `localhost:3306`, usuário `root` sem senha (ex.: XAMPP)

## Como rodar

### 1. Banco de dados

Ligue o MySQL. O banco se chama `restaurante` e as tabelas são criadas sozinhas pelo
backend na primeira execução. Para criar ou recriar manualmente, na raiz do repositório:

```bash
mysql -u root < backend/database/schema.sql
mysql -u root restaurante < backend/database/dados-exemplo.sql
```

Detalhes e diagrama de relacionamento em [`backend/database/README.md`](backend/database/README.md).

### 2. Backend

```bash
cd backend
```

Opcional, mas necessário para ter o administrador e o e-mail: copie
`src/main/resources/application-local.properties.example` para
`src/main/resources/application-local.properties` e preencha (senha do admin, chave do JWT).
Esse arquivo não vai para o Git.

```bash
.\mvnw.cmd spring-boot:run
```

(no Linux/macOS: `./mvnw spring-boot:run`). A API sobe em **http://localhost:8080**.

### 3. Frontend

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Abra **http://localhost:3000**. O backend precisa estar no ar.

## Perfis e segurança (JWT)

| Ação | Quem acessa | Token? |
|---|---|---|
| Login (`POST /public/login`) e registro (`POST /public/register`) | Todos | Não |
| Listar imóveis / um imóvel | Todos | Não |
| Cadastrar, alterar e remover imóveis | ADMIN | Sim |
| Gerenciar usuários (`/users`) | ADMIN | Sim |
| Alterar status de imóvel (`PATCH /imoveis/{id}/status`) | Qualquer usuário autenticado | Sim |

Erros: **401** (sem token, token inválido ou expirado) e **403** (token válido, sem permissão).
O token é enviado em `Authorization: Bearer <token>`.

O login devolve `{ "token": "...", "tipo": "ADMIN" | "USER", "expiraEmSegundos": 7200 }`, e o JWT
traz as claims `sub` (e-mail), `tipo` e `exp`.

### Vitrine pública

`GET /imoveis/vitrine` (sem token) devolve só imóveis disponíveis, paginados:

| Parâmetro | Descrição |
|---|---|
| `bairroId` | filtra por bairro |
| `finalidade` | `VENDA` ou `ALUGUEL` (define qual preço é usado no filtro e na ordenação) |
| `precoMin`, `precoMax` | faixa de preço |
| `ordem` | `recentes` (padrão), `preco_asc` ou `preco_desc` |
| `pagina`, `tamanho` | paginação (`pagina` começa em 0; `tamanho` padrão 9, máximo 50) |

`GET /fotos/{id}/arquivo` serve a imagem de uma foto.

## Telas do front-end

| Rota | Quem acessa |
|---|---|
| `/` vitrine com filtros, ordenação e paginação | Todos |
| `/imoveis/{id}` detalhe, galeria e botão "Entrar em contato" | Todos |
| `/login` | Todos |
| `/cliente` | USER |
| `/admin` | ADMIN |

Sem sessão, as telas protegidas levam ao login; perfil errado volta para a área do próprio perfil;
um 401 apaga o token e desloga. O menu muda conforme o perfil e o botão "Sair" apaga o token.

## Andamento

- [x] **Aula 1: setup e testes do backend.** Backend no ar com CORS, regras de segurança testadas,
  projeto front-end criado e primeira chamada à API (listar imóveis) funcionando.
- [x] **Aula 2: vitrine e área do cliente.** Vitrine, detalhe, contato, paginação, filtros e ordenação;
  login com validação, JWT nas requisições, rotas protegidas por perfil, logout e menu por perfil.
- [ ] Tabelas `ofertas`, `contratos` e `favoritos` no backend
- [ ] Ofertas, favoritos e contratos do cliente
- [ ] CRUDs, gestão e painel do administrador
