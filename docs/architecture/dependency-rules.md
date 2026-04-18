# Dependency Rules

## Regra principal

Dependencias devem respeitar a fronteira de runtime:

- `client components -> server actions/route handlers -> coreClient -> tahnamao-core`

## Proibicoes

- Componentes client chamando API interna do core diretamente.
- Uso de segredo (`CORE_API_BASE_URL`, tokens) em codigo executado no browser.
- Implementacao de regra de negocio critica no painel.

## Checklist por PR

- [ ] Alguma chamada ao core vazou para o client?
- [ ] O mapeamento `docs/contracts/consumer-core-mapping.md` foi atualizado?
- [ ] Houve alteracao de contrato com impacto de UX/erro tratada no painel?
