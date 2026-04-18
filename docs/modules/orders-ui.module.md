# Module Spec - orders-ui

## Responsabilidade

Disponibilizar operacao de pedidos para backoffice (lista, detalhe, atualizacao em tempo real).

## Entradas

- Endpoints de pedidos no core.
- Stream de eventos de pedidos (quando contrato estiver definido).

## Saidas

- Tabela de pedidos, detalhe operacional e alertas em tempo real.

## Dependencias

- Server Actions de pedidos.
- Route handler de stream/proxy (quando habilitado).
