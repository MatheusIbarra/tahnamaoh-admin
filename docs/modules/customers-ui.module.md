# Module Spec - customers-ui

## Responsabilidade

Gerenciar visao administrativa de clientes (listagem e bloqueio/desbloqueio).

## Entradas

- Lista de clientes via `GET /admin/clients` com filtros (`name`, `email`) e paginação (`page`, `limit`).
- Comandos de bloqueio/desbloqueio por templates de path configuráveis em ambiente.

## Saidas

- Tela `app/(admin)/clients/page.tsx` com busca por nome/e-mail, tabela, status e paginação server-side.
- Loading state com skeleton em `app/(admin)/clients/loading.tsx`.
- Estado vazio com mensagem de orientação quando não houver resultados.
- Acoes de bloqueio/desbloqueio com retorno de operacao.

## Dependencias

- Server Action `getClientsAction` (`src/server/actions/admin/clients.ts`).
- `coreClient`.
