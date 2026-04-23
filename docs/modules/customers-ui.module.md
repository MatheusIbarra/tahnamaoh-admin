# Module Spec - customers-ui

## Responsabilidade

Gerenciar visao administrativa de clientes (listagem, detalhe e bloqueio/desbloqueio).

## Entradas

- Lista de clientes via `GET /admin/clients` com filtros (`name`, `email`) e paginação (`page`, `limit`).
- Snapshot de cliente via `GET /admin/clients/{clientId}` para consolidar dados pessoais.
- Comandos de bloqueio/desbloqueio em `/admin/clients/{clientId}/block|unblock`.

## Saidas

- Tela `app/(admin)/clients/page.tsx` com busca por nome/e-mail, tabela, status e paginação server-side.
- Tela `app/(admin)/clients/[id]/page.tsx` com dados pessoais, endereços salvos e histórico de pedidos paginado.
- Loading state com skeleton em `app/(admin)/clients/loading.tsx`.
- Estado vazio com mensagem de orientação quando não houver resultados.
- Acoes de bloqueio/desbloqueio no detalhe, com confirmação em dialog para bloqueio e toast de sucesso/erro.

## Dependencias

- Server Action `getClientsAction` (`src/server/actions/admin/clients.ts`).
- Server Actions `getClientByIdAction`, `blockClientAction`, `unblockClientAction` (`src/server/actions/admin/clients.ts`).
- `ClientAdminActions` para controles condicionais por status (`src/components/admin/ClientAdminActions.tsx`).
- `coreClient`.
