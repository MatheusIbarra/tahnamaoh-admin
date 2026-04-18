# AGENTS - Memory First Protocol

This repository uses a strict "memory first" workflow.

## Primary Goal

Preserve architectural integrity and security boundaries before writing code.

## Mandatory Order For Any Task

1. Read project context/governance files first.
2. Identify active architecture, contracts, business rules, and module constraints.
3. Propose a short change plan.
4. Implement only after confirming alignment with architecture, contracts, docs, and tests.

## Priority Files To Read Before Any Change

- `README.md`
- `AGENTS.md`
- `docs/system-overview.md`
- `docs/architecture/system-context.md`
- `docs/architecture/dependency-rules.md`
- `docs/contracts/consumer-core-mapping.md`
- `docs/modules/*`
- `docs/adr/*`
- files in the directly affected module

## Non-Negotiable Rules

- Do not implement API business rules in the admin; core remains the authority.
- Do not call internal APIs directly from client components.
- Do not create, remove, or change proxy actions/routes without updating `docs/contracts/consumer-core-mapping.md` in the same task.
- Do not expose secrets, tokens, or core base URL in client-side code.
- Do not skip documentation updates for architecture-impacting changes.
- Do not make large changes without explaining impact on modules, contracts, and tests.

## Required Response Order

1. Context read
2. Constraints found
3. Change plan
4. Files to modify
5. Impact on contracts/docs/tests

## Conflict/Missing Context Handling

- If context is missing, stop and explicitly list missing files/decisions.
- If core contract and local docs conflict, report conflict before implementation.
- For auth, admin actions, and operational data, treat documentation and tests as mandatory gates.
