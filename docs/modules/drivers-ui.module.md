# Module Spec - drivers-ui

## Responsabilidade

Exibir e operar o fluxo administrativo de revisao de motoristas.

## Entradas

- Lista de pendentes do core.
- Detalhe do motorista via `GET /admin/drivers/{driverId}`.
- Historico de corridas retornado no payload de detalhe (paginacao local na UI).
- Comandos administrativos:
  - `POST /admin/drivers/{driverId}/approve` (`reason` obrigatorio)
  - `POST /admin/drivers/{driverId}/block` (`reason` obrigatorio)
  - `POST /admin/drivers/{driverId}/unblock`

## Saidas

- Tela `app/(app)/drivers/[driverId]/page.tsx` com dados pessoais, CNH, veiculo e status.
- Acao condicional por status (`PENDENTE_APROVACAO`, `BLOQUEADO`).
- Modal de aprovacao com `reason` obrigatorio, `notes` opcional e checklist de revisao.
- Modal de bloqueio com `reason` obrigatorio e `notes` opcional.
- Feedback visual (toast) de sucesso/erro apos cada acao.

## Dependencias

- Server Actions de admin drivers.
- `coreClient` com header `Authorization: Bearer <admin-token>`.
