# System Overview - tahnamao-admin

## O que o sistema faz

`tahnamao-admin` e o painel administrativo web da plataforma Tahnamao. O sistema oferece operacao e acompanhamento administrativo com Next.js, usando Server Actions como proxy para a API interna `tahnamao-core`.

## Objetivos principais

- Centralizar operacoes administrativas em uma interface web unica.
- Isolar o browser da URL e detalhes da API interna.
- Garantir consumo de contrato de API com rastreabilidade documental.
- Permitir evolucao incremental do painel por modulos (drivers, customers, orders, dashboard).

## Capacidades planejadas

### Autenticacao Admin

- Fluxo de login no painel com sessao httpOnly.
- Integracao com endpoint oficial do core quando disponivel.

### Gestao de Motoristas

- Listagem de pendentes.
- Visualizacao de detalhes para revisao.
- Acoes de aprovar, rejeitar, bloquear e desbloquear.

### Gestao de Clientes

- Listagem de clientes.
- Acao de bloqueio/desbloqueio conforme contrato do core.

### Gestao de Pedidos

- Listagem administrativa.
- Detalhe de pedido.
- Atualizacao em tempo real via stream/proxy quando endpoint estiver definido no core.

### Dashboard

- KPIs operacionais agregados.
- Graficos de acompanhamento para suporte a decisao.

## Limites arquiteturais

- O painel nao implementa regra critica de negocio: apenas orquestra chamadas ao core.
- Qualquer validacao autoritativa pertence ao `tahnamao-core`.
- Credenciais, segredos e endpoints internos ficam restritos ao servidor Next.

## Fontes de verdade

- Mapeamento de consumo do painel: `docs/contracts/consumer-core-mapping.md`
- Regras internas do painel: `docs/modules/*`
- Decisoes arquiteturais: `docs/adr/*`

## Regra de manutencao obrigatoria

Sempre que uma acao de proxy for criada, alterada ou removida:

1. Atualizar `docs/contracts/consumer-core-mapping.md`.
2. Atualizar a documentacao de modulo impactado em `docs/modules/*`.
3. Ajustar testes relacionados ao cliente HTTP e tratamento de erro.
