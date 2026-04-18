# System Context

## Papel do `tahnamao-admin`

`tahnamao-admin` e uma interface administrativa que consome o `tahnamao-core` por proxy server-side.

## Consumidores

- Equipe administrativa e operacional.
- Suporte interno para revisao de onboarding e monitoramento.

## Dependencias externas

- `tahnamao-core` como API soberana de negocio.
- Banco e integrações permanecem encapsulados no core.

## Diretriz essencial

Nenhuma regra critica de aprovacao, autenticacao ou fluxo operacional deve ser decidida no admin. O painel solicita operacoes; o core valida e decide.
