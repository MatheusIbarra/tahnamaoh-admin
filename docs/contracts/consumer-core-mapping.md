# Consumer/Core Mapping - tahnamao-admin -> tahnamao-core

## Objetivo

Mapear cada funcionalidade administrativa para o contrato HTTP consumido do `tahnamao-core`.

## Drivers (mapeado no OpenAPI local)

| Feature do painel | Metodo | Path core | Status esperado | Observacao |
|---|---|---|---|---|
| Listar pendentes | GET | `/admin/drivers/pending` | 200 | Query `page`, `pageSize` |
| Detalhe motorista | GET | `/admin/drivers/{driverId}` | 200 | Snapshot de revisao |
| Aprovar motorista | POST | `/admin/drivers/{driverId}/approve` | 200 | `reason` recomendado |
| Rejeitar motorista | POST | `/admin/drivers/{driverId}/reject` | 200 | `reason` obrigatorio no dominio |
| Bloquear motorista | POST | `/admin/drivers/{driverId}/block` | 200 | `reason` obrigatorio no dominio |
| Desbloquear motorista | POST | `/admin/drivers/{driverId}/unblock` | 200 | Pode incluir `reason` |
| Aprovar documento | POST | `/admin/drivers/{driverId}/documents/{documentId}/approve` | 200 | |
| Rejeitar documento | POST | `/admin/drivers/{driverId}/documents/{documentId}/reject` | 200 | `reason` recomendada |

## Header administrativo

- Header requerido: `x-admin-id`
- Fonte no admin: sessao httpOnly (fallback local em ambiente de desenvolvimento)

## Customers (pendente de reconciliacao)

- Acoes implementadas no admin por paths configuraveis em ambiente:
  - `CORE_ADMIN_CUSTOMERS_LIST_PATH`
  - `CORE_ADMIN_CUSTOMERS_BLOCK_PATH_TEMPLATE`
  - `CORE_ADMIN_CUSTOMERS_UNBLOCK_PATH_TEMPLATE`
- Enquanto os paths nao forem configurados, o painel retorna erro `501` orientando sincronizacao de contrato.

## Orders (pendente de reconciliacao)

- Acoes implementadas no admin por paths configuraveis em ambiente:
  - `CORE_ADMIN_ORDERS_LIST_PATH`
  - `CORE_ADMIN_ORDERS_DETAILS_PATH_TEMPLATE`
  - `CORE_ADMIN_ORDERS_STREAM_PATH`
- Stream SSE disponivel em `GET /api/orders/stream` no admin, repassando para o path configurado no core.
- Enquanto os paths nao forem configurados, o painel retorna erro `501` orientando sincronizacao de contrato.

## Auth Admin (pendente de reconciliacao)

- Fluxo de login de painel preparado localmente.
- Integracao real depende de endpoint oficial do core para autenticacao administrativa.
