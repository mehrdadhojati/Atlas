---
title: Use d3-force for graph rendering
category: technical
status: accepted
created: 2026-09-26
updated: 2026-09-26
origin_session: "[[2026-09-26 - Atlas initial build and vault scaffold]]"
tags: [decision, atlas]
---

# TDR-001 - Use d3-force for graph rendering

## Context

The graph needs the same spring physics as Obsidian: links pull nodes together,
charge repels them, and dragging re-arranges a neighborhood.

## Decision

Use `d3-force` for the simulation, drawn on an HTML `<canvas>` in the webview.
It is bundled into the webview script at build time.

## Alternatives Considered

- **Sigma.js** — rejected: heavier, WebGL-oriented; overkill for this scale.
- **Custom physics** — rejected: reinventing well-tested force simulation.

## Consequences

- Battle-tested force simulation with drag/collide/link forces.
- No runtime `node_modules` needed in the extension host (bundled).
- Cost: a build step is required to bundle the webview.

## Related

- Origin session: [[2026-09-26 - Atlas initial build and vault scaffold]]
- Related decisions: [[TDR-002 - Use esbuild as the bundler]]
