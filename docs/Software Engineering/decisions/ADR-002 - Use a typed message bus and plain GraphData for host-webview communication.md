---
title: Use a typed message bus and plain GraphData for host-webview communication
category: architecture
status: accepted
created: 2026-09-26
updated: 2026-09-26
origin_session: "[[2026-09-26 - Atlas initial build and vault scaffold]]"
tags: [decision, atlas]
---

# ADR-002 - Use a typed message bus and plain GraphData for host-webview communication

## Context

The extension host and webview are separate processes. They must exchange graph
data and user actions without coupling the webview to VS Code objects.

## Decision

Communicate over a typed message bus of `{ type, payload }` messages. The host
ships a plain `GraphData { nodes, edges }` JSON model; the webview posts actions
such as `openNode`.

## Alternatives Considered

- **Passing VS Code objects to the webview** — impossible across the sandbox boundary.
- **Reconstructing files in the webview via a command URI** — rejected: broader
  privilege and more surface area.

## Consequences

- The webview stays a pure, sandboxed renderer with no `vscode` dependency.
- The contract is a stable, documented JSON shape.
- Cost: the host must react to `ready`/`openNode` messages explicitly.

## Related

- Origin session: [[2026-09-26 - Atlas initial build and vault scaffold]]
- Related decisions: [[ADR-001 - Adopt layered architecture with a pure domain core]]
