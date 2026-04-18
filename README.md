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

## Documentação

- Visão geral do sistema: `docs/system-overview.md`
- Arquitetura: `docs/architecture`
- Módulos do painel: `docs/modules`
- Mapeamento de consumo do core: `docs/contracts/consumer-core-mapping.md`
- ADRs: `docs/adr`
