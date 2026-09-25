---
title: Adopt layered architecture with a pure domain core
category: architecture
status: accepted
created: 2026-09-26
updated: 2026-09-26
origin_session: "[[2026-09-26 - Atlas initial build and vault scaffold]]"
tags: [decision, atlas]
---

# ADR-001 - Adopt layered architecture with a pure domain core

## Context

Atlas must be testable and replaceable: parsing and graph construction should
not depend on the VS Code API, and the renderer should be swappable without
touching parsing.

## Decision

Use a layered architecture with dependencies pointing inward: `extension`
(composition root) → `infrastructure` (adapters) → `application` (use cases) →
`domain` (pure model + parser). The domain imports nothing from `vscode` or Node.

## Alternatives Considered

- **Single-file extension** — rejected: untestable and hard to evolve.
- **Hexagonal/ports-adapters with a container** — rejected as heavier than needed
  for this scale.

## Consequences

- Domain logic is unit-testable in isolation (vitest).
- Renderer or VS Code API changes stay isolated to the edge layers.
- Cost: more files and discipline around dependency direction.

## Related

- Origin session: [[2026-09-26 - Atlas initial build and vault scaffold]]
- Related decisions: [[TDR-002 - Use esbuild as the bundler]]
