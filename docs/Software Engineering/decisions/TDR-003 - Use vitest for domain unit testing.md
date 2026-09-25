---
title: Use vitest for domain unit testing
category: technical
status: accepted
created: 2026-09-26
updated: 2026-09-26
origin_session: "[[2026-09-26 - Atlas initial build and vault scaffold]]"
tags: [decision, atlas]
---

# TDR-003 - Use vitest for domain unit testing

## Context

The pure domain layer (link extraction) must be unit-tested without a VS Code host.

## Decision

Use `vitest` as the test runner for the domain layer.

## Alternatives Considered

- **Node's built-in `node:test`** — rejected: weaker TS/ESM ergonomics.
- **Jest** — rejected: heavier and slower for this small suite.

## Consequences

- Fast, zero-config TS tests for the parser strategies.
- Cost: one dev dependency.

## Related

- Origin session: [[2026-09-26 - Atlas initial build and vault scaffold]]
- Related decisions: [[ADR-001 - Adopt layered architecture with a pure domain core]]
