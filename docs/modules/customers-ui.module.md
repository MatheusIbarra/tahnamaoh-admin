# Module Spec - customers-ui

## Responsabilidade

Gerenciar visao administrativa de clientes (listagem e bloqueio/desbloqueio).

## Entradas

- Endpoints de clientes do core (a sincronizar no mapping).

## Saidas

- Lista de clientes com filtros e status.
- Acoes de bloqueio/desbloqueio com retorno de operacao.

## Dependencias

- Server Actions de clientes.
- `coreClient`.
