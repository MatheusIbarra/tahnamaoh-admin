# tahnamao-admin

Painel administrativo do ecossistema Tahnamao.

## Stack

- Next.js (App Router) + TypeScript
- Server Actions e Route Handlers como proxy seguro para o core
- Tailwind CSS

## Princípios

- O admin é consumidor do core e não autoridade de regra de negócio.
- Toda chamada para API interna ocorre no servidor (nunca no browser).
- Contratos consumidos do core devem ficar sincronizados com a documentação local.
- Documentação viva e versionada no repositório.

## Como rodar

1. Copie `.env.example` para `.env.local`.
2. Configure variáveis obrigatórias.
3. Execute `yarn dev`.

## Variáveis esperadas

- `CORE_API_BASE_URL`: URL base da API `tahnamao-core` (ex.: `http://localhost:3001/api/v1`).
- `ADMIN_SESSION_SECRET`: segredo para assinatura da sessão do painel.
- `ADMIN_DEFAULT_ID`: id administrativo usado em ambiente local enquanto o login admin do core não estiver disponível.
- `CORE_ADMIN_CUSTOMERS_LIST_PATH`: path para listagem de clientes (contrato do core).
- `CORE_ADMIN_CUSTOMERS_BLOCK_PATH_TEMPLATE`: template de bloqueio de cliente (`/admin/customers/{customerId}/block`).
- `CORE_ADMIN_CUSTOMERS_UNBLOCK_PATH_TEMPLATE`: template de desbloqueio de cliente.
- `CORE_ADMIN_ORDERS_LIST_PATH`: path para listagem de pedidos.
- `CORE_ADMIN_ORDERS_DETAILS_PATH_TEMPLATE`: template de detalhe de pedido (`/admin/orders/{orderId}`).
- `CORE_ADMIN_ORDERS_STREAM_PATH`: path do stream de pedidos para proxy SSE.

## Documentação

- Visão geral do sistema: `docs/system-overview.md`
- Arquitetura: `docs/architecture`
- Módulos do painel: `docs/modules`
- Mapeamento de consumo do core: `docs/contracts/consumer-core-mapping.md`
- ADRs: `docs/adr`
