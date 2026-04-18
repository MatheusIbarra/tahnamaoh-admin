# Consumer/Core Mapping - tahnamao-admin -> tahnamao-core

## Objetivo

Mapear cada funcionalidade administrativa para o contrato HTTP consumido do `tahnamao-core`.

## Drivers (mapeado no OpenAPI local)

| Feature do painel | Metodo | Path core | Status esperado | Observacao |
|---|---|---|---|---|
| Listar pendentes | GET | `/admin/drivers/pending` | 200 | Query `page`, `pageSize` |
| Detalhe motorista | GET | `/admin/drivers/{driverId}` | 200 | Snapshot de revisao |
| Aprovar motorista | POST (fallback PATCH) | `/admin/drivers/{driverId}/approve` | 200 | `reason` obrigatorio no dominio (`approval reason is required`) |
| Rejeitar motorista | POST | `/admin/drivers/{driverId}/reject` | 200 | `reason` obrigatorio no dominio |
| Bloquear motorista | POST (fallback PATCH) | `/admin/drivers/{driverId}/block` | 200 | `reason` obrigatorio no dominio (`block reason is required`) |
| Desbloquear motorista | POST (fallback PATCH) | `/admin/drivers/{driverId}/unblock` | 200 | Visivel quando motorista bloqueado |
| Aprovar documento | POST | `/admin/drivers/{driverId}/documents/{documentId}/approve` | 200 | |
| Rejeitar documento | POST | `/admin/drivers/{driverId}/documents/{documentId}/reject` | 200 | `reason` recomendada |

## Header administrativo

- Header requerido: `Authorization: Bearer <admin-token>`
- Fonte no admin: token retornado por `POST /admin/auth/login` e persistido em sessão httpOnly.

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

## Auth Admin

| Feature do painel | Metodo | Path core | Status esperado | Observacao |
|---|---|---|---|---|
| Login admin | POST | `/admin/auth/login` | 200 | Sessão grava `accessToken` admin para uso em rotas `/admin/*` |
