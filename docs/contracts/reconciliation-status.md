# Reconciliation Status - Core OpenAPI vs Admin Scope

## Fonte verificada no workspace

- `tahnamao-core/docs/contracts/openapi/openapi.yaml`

## Endpoints confirmados para implementacao imediata

- `GET /admin/drivers/pending`
- `GET /admin/drivers/{driverId}`
- `POST /admin/drivers/{driverId}/approve`
- `POST /admin/drivers/{driverId}/reject`
- `POST /admin/drivers/{driverId}/block`
- `POST /admin/drivers/{driverId}/unblock`
- `POST /admin/drivers/{driverId}/documents/{documentId}/approve`
- `POST /admin/drivers/{driverId}/documents/{documentId}/reject`

## Escopo da story sem contrato confirmado neste workspace

- Auth admin dedicado no core
- Gestao de clientes (listagem/bloqueio)
- Gestao de pedidos (listagem/detalhe/tempo real)

## Decisao aplicada no admin

- Drivers: implementacao direta contra paths confirmados.
- Customers/Orders: proxy implementado com paths configuraveis por ambiente (`CORE_ADMIN_*`) e erro explicito `501` quando nao configurado.
- Stream em tempo real: route handler `GET /api/orders/stream` pronto para repasse quando `CORE_ADMIN_ORDERS_STREAM_PATH` estiver definido.
