# ADR-0001 Admin as Core Consumer via Server Proxy

- Status: Accepted
- Data: 2026-04-18

## Contexto

O painel administrativo precisa acessar APIs internas sem expor detalhes de rede e sem mover regras criticas para o frontend.

## Decisao

Adotar Next.js com Server Actions e Route Handlers como unica camada de proxy para o `tahnamao-core`.

## Consequencias

### Positivas

- Reduz exposicao de infraestrutura interna no browser.
- Padroniza tratamento de autenticacao e erros no servidor.
- Facilita observabilidade e evolucao de contratos consumidos.

### Negativas

- Aumenta responsabilidade da camada server do painel.
- Exige disciplina de sincronizacao de docs de mapeamento.

## Guardrails

- Nenhum componente client chama API interna diretamente.
- Toda mudanca de proxy atualiza `docs/contracts/consumer-core-mapping.md`.
- Toda decisao de negocio sensivel permanece no core.
