# Module Spec - orders-ui

## Responsabilidade

Disponibilizar operacao de pedidos para backoffice (lista, detalhe, atualizacao em tempo real).

## Entradas

- Endpoints administrativos de pedidos no core (`/admin/orders` e `/admin/orders/{orderId}`).
- Stream de eventos de pedidos (quando contrato estiver definido).

## Saidas

- Tela `app/(admin)/orders/page.tsx` com filtros por status, período, cliente e motorista.
- Tabela de pedidos com badge de status, paginação server-side e link para detalhe.
- Loading state com skeleton em `app/(admin)/orders/loading.tsx`.
- Estado vazio com mensagem clara para ausência de resultados.

## Dependencias

- Server Actions `getOrdersAction` e `getOrderDetails` (`src/server/actions/admin/orders.ts`).
- Route handler de stream/proxy (quando habilitado).
