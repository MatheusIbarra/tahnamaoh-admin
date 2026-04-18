# Module Spec - drivers-ui

## Responsabilidade

Exibir e operar o fluxo administrativo de revisao de motoristas.

## Entradas

- Lista de pendentes do core.
- Snapshot de motorista.
- Comandos de aprovacao/rejeicao/bloqueio/desbloqueio.

## Saidas

- Interface de revisao e feedback de operacao.
- Estados de sucesso/erro por acao administrativa.

## Dependencias

- Server Actions de admin drivers.
- `coreClient` com header `x-admin-id`.
