# Consumer/Core Mapping - tahnamao-admin -> tahnamao-core

## Objetivo

Mapear cada funcionalidade administrativa para o contrato HTTP consumido do `tahnamao-core`.

## Drivers (mapeado no OpenAPI local)

| Feature do painel | Metodo | Path core | Status esperado | Observacao |
|---|---|---|---|---|
| Listar motoristas | GET | `/admin/drivers` | 200 | Query `status`, `search`, `page`, `limit` |
| Detalhe motorista | GET | `/admin/drivers/{driverId}` | 200 | Snapshot de revisao |
| Aprovar motorista | POST (fallback PATCH) | `/admin/drivers/{driverId}/approve` | 200 | `reason` obrigatorio no dominio (`approval reason is required`) |
| Rejeitar motorista | POST | `/admin/drivers/{driverId}/reject` | 200 | `reason` obrigatorio no dominio |
| Bloquear motorista | POST (fallback PATCH) | `/admin/drivers/{driverId}/block` | 200 | `reason` obrigatorio no dominio (`block reason is required`) |
| Desbloquear motorista | POST (fallback PATCH) | `/admin/drivers/{driverId}/unblock` | 200 | Visivel quando motorista bloqueado |
| Aprovar documento | POST | `/admin/drivers/{driverId}/documents/{documentId}/approve` | 200 | |
| Rejeitar documento | POST | `/admin/drivers/{driverId}/documents/{documentId}/reject` | 200 | `reason` recomendada |

## Header administrativo

- Header requerido: `Authorization: Bearer <admin-token>`
- Fonte no admin: `accessToken` e `refreshToken` retornados por `POST /admin/auth/login`, persistidos em sessão httpOnly.
- Renovação: em `401` do core, o `coreClient` chama `POST /admin/auth/refresh` com o `refreshToken` da sessão, atualiza o cookie e repete a requisição uma vez.

## Customers

| Feature do painel | Metodo | Path core | Status esperado | Observacao |
|---|---|---|---|---|
| Listar clientes | GET | `/admin/clients` | 200 | Query `name`, `email`, `page`, `limit` |
| Detalhe do cliente | GET | `/admin/clients/{clientId}` | 200 | Snapshot para tela de detalhe administrativo |
| Bloquear cliente | PATCH (fallback POST) | `/admin/clients/{clientId}/block` | 200 | Acao da tela de detalhe com feedback via query params |
| Desbloquear cliente | PATCH (fallback POST) | `/admin/clients/{clientId}/unblock` | 200 | Botao visivel apenas para cliente bloqueado |

## Orders

| Feature do painel | Metodo | Path core | Status esperado | Observacao |
|---|---|---|---|---|
| Listar pedidos | GET | `/admin/orders` | 200 | Query `status`, `startDate`, `endDate`, `customer`, `driver`, `page`, `limit` |
| Detalhe do pedido | GET | `/admin/orders/{orderId}` | 200 | Link direto da listagem para página de detalhe |
| Stream de pedidos | GET | `CORE_ADMIN_ORDERS_STREAM_PATH` | 200 | Proxy SSE em `GET /api/orders/stream` no admin |

## Auth Admin

| Feature do painel | Metodo | Path core | Status esperado | Observacao |
|---|---|---|---|---|
| Login admin | POST | `/admin/auth/login` | 200 | Sessão grava `accessToken` + `refreshToken` |
| Refresh admin | POST | `/admin/auth/refresh` | 200 | Usado automaticamente pelo `coreClient` após `401` |
