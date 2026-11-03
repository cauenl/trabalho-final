# Imobiliária Web

Front-end da imobiliária, em **React + Next.js (App Router, TypeScript, Tailwind)**,
que consome a API REST do backend Spring Boot.

## Pré-requisitos

- Node.js 20 ou superior
- Backend rodando em `http://localhost:8080` (pasta [`../backend`](../backend))
- MySQL ligado

## Banco de dados

Os scripts SQL (estrutura das tabelas e dados de exemplo) estão em [`../backend/database/`](../backend/database/).

## Como rodar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o arquivo de ambiente a partir do modelo:

   ```bash
   copy .env.example .env.local
   ```

3. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Abra http://localhost:3000

## Variáveis de ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL base da API | `http://localhost:8080` |

## Estrutura

- `app/`: páginas (App Router)
- `components/`: componentes reutilizáveis
- `services/`: chamadas à API por assunto
- `lib/api.ts`: cliente HTTP (token, tratamento de erros 401/403/404/409)
- `types/`: tipos TypeScript dos dados da API

## Andamento

- [x] Aula 1: setup e primeira chamada à API (listar imóveis)
