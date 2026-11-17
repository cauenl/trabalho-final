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

### Contato sobre um imóvel (e-mail pelo Mailgun)

`POST /imoveis/{id}/contato` (público) com `{ "nome", "email", "telefone", "mensagem" }` envia um e-mail
**para a imobiliária** com o código, o tipo, o bairro e o valor do imóvel e os dados do visitante;
"Responder" no e-mail vai para o visitante (Reply-To).

Configuração em `application-local.properties` (ou variáveis de ambiente):

| Propriedade | Para que serve |
|---|---|
| `spring.mail.username` / `spring.mail.password` | conta SMTP do Mailgun |
| `app.imobiliaria.email` | e-mail que **recebe** os contatos |

> No sandbox do Mailgun, o destinatário precisa estar em **Authorized Recipients** (e confirmado pelo
> link que o Mailgun envia). Sem isso o envio é recusado e a tela mostra um erro amigável.
> Sem `app.imobiliaria.email`, o endpoint responde **503**.

## Telas do front-end

| Rota | Quem acessa |
|---|---|
| `/` vitrine com filtros laterais, ordenação e paginação | Todos (inclusive o admin) |
| `/imoveis/{id}` detalhe, galeria e formulário "Entrar em contato" | Todos (inclusive o admin) |
| `/login` | Todos |
| `/cliente/**` (área do cliente) | **só USER**: o admin é levado ao painel |
| `/corretor/**` | **só CORRETOR** |
| `/admin/**` (painel e cadastros) | **só ADMIN**: os outros perfis voltam à própria área |

Sem sessão, as telas protegidas levam ao login; perfil errado volta para a área do próprio perfil;
um 401 apaga o token e desloga. O menu muda conforme o perfil e o botão "Sair" apaga o token.

## Aula 3: perfis, ofertas, contratos e painel

Três perfis: **Cliente (`USER`)**, **Corretor (`CORRETOR`)** e **Administrador (`ADMIN`)**.
O admin cria corretores e clientes em `/admin/usuarios` (ou altera o perfil de um usuário).

**Fluxo do checkpoint:** cliente envia oferta → corretor aceita e prepara o contrato → administrador
aprova (o cliente recebe o PDF por e-mail) → cliente assina.

| Endpoint | Quem |
|---|---|
| `POST /ofertas`, `GET /ofertas/minhas`, `PATCH /ofertas/{id}/cancelar` | USER |
| `GET /ofertas?status=`, `PATCH /ofertas/{id}/aceitar` e `/recusar` | CORRETOR, ADMIN |
| `POST /contratos` (prepara o contrato a partir de uma oferta aceita), `GET /contratos` | CORRETOR, ADMIN |
| `PATCH /contratos/{id}/aprovar`, `/recusar`, `/cancelar` | ADMIN |
| `GET /contratos/meus`, `POST /contratos/{id}/assinar` | USER (só depois da aprovação) |
| `GET /contratos/{id}/pdf` | dono do contrato ou equipe |
| `GET/POST/DELETE /favoritos` | USER |
| `GET /painel/resumo` (totais e dados dos gráficos) | CORRETOR, ADMIN |

**Regras de negócio** (erro **409** com mensagem em texto):

- Só imóvel *Disponível* recebe ofertas; reservado, alugado ou vendido **não mostra** o formulário "Fazer oferta".
- Um cliente não tem duas ofertas pendentes para o mesmo imóvel, mas o imóvel pode ter ofertas de vários clientes.
- O tipo da oferta (compra ou aluguel) precisa ter preço cadastrado no imóvel.
- Ao **aceitar** uma oferta, o imóvel vira *Reservado* e as outras ofertas pendentes ficam **em espera**.
- Ao **assinar** o contrato, o imóvel vira *Vendido* (compra) ou *Alugado* (aluguel) e as demais ofertas são recusadas.
- Se o cliente desistir, o **admin cancela** o contrato (aguardando aprovação ou assinatura): o imóvel volta a
  *Disponível*, a oferta aceita é cancelada e as ofertas em espera voltam a pendentes. Contrato assinado não cancela.
- Um admin não exclui nem rebaixa a si mesmo.

Telas: `/cliente` (resumo, ofertas, favoritos, contratos com assinatura), `/corretor` (ofertas e contratos),
`/admin` (painel com gráficos, CRUD de imóveis, fotos, bairros, tipos e usuários, ofertas e contratos).
Todas as telas têm estados de carregando, erro (com "tentar de novo") e vazio, e confirmação antes de
excluir, cancelar, recusar, aprovar ou assinar.

## Andamento

- [x] **Aula 1: setup e testes do backend.** Backend no ar com CORS, regras de segurança testadas,
  projeto front-end criado e primeira chamada à API (listar imóveis) funcionando.
- [x] **Aula 2: vitrine e área do cliente.** Vitrine, detalhe, contato, paginação, filtros e ordenação;
  login com validação, JWT nas requisições, rotas protegidas por perfil, logout e menu por perfil.
- [x] **Aula 3: perfis, ofertas, favoritos, contratos (envio, aprovação e assinatura) e painéis com gráficos.**

## Dados para demonstrar a paginação

As tabelas do painel do admin (imóveis, bairros, usuários, ofertas e contratos) paginam de 10 em 10.
Para ter registros suficientes, com o backend já executado uma vez:

```bash
mysql -u root --default-character-set=utf8mb4 restaurante < backend/database/dados-paginacao.sql
```

Cria 18 imóveis, 12 clientes (`cliente01@demo.com` a `cliente12@demo.com`, senha `Teste12345`),
9 bairros, 24 ofertas e 12 contratos em várias situações. Pode ser rodado de novo sem duplicar.

## E-mails automáticos (Mailgun)

Toda mudança de situação avisa por e-mail quem é afetado. O envio é feito em segundo plano, depois que a
alteração foi gravada, e uma falha de e-mail nunca desfaz a ação (só aparece no log do backend).

| Evento | Quem recebe |
|---|---|
| Oferta enviada | cliente (confirmação) e imobiliária |
| Oferta aceita / recusada | cliente |
| Oferta em espera (outra foi aceita) | clientes das outras ofertas |
| Oferta cancelada pelo cliente | imobiliária |
| Contrato preparado | imobiliária (para o admin aprovar) |
| Contrato aprovado | cliente, com o PDF anexo |
| Contrato recusado pelo admin | corretor que o preparou |
| Contrato cancelado | cliente; ofertas em espera voltam a pendentes e seus clientes são avisados |
| Contrato assinado | cliente e imobiliária; clientes das ofertas recusadas |

No **sandbox** do Mailgun só chega e-mail para endereços em *Authorized Recipients*; para os demais o log mostra
`E-mail NÃO enviado ... Authorized recipients`. Usuário e senha SMTP ficam só no `application-local.properties`.
