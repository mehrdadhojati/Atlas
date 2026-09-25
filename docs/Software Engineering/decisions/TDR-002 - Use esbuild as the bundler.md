---
title: Use esbuild as the bundler
category: technical
status: accepted
created: 2026-09-26
updated: 2026-09-26
origin_session: "[[2026-09-26 - Atlas initial build and vault scaffold]]"
tags: [decision, atlas]
---

# TDR-002 - Use esbuild as the bundler

## Context

The extension host and webview both need building: the host to a Node/CJS bundle
(external `vscode`), the webview to an IIFE bundle that includes `d3-force`.

## Decision

Use `esbuild` via a small `esbuild.mjs` script to build both targets.

## Alternatives Considered

- **tsc** — rejected: no bundling; the webview could not inline `d3-force`.
- **webpack/rollup** — rejected: heavier configuration for no benefit here.

## Consequences

- One fast, dependency-free build step for both targets.
- Cost: a custom build script to maintain.

## Related

- Origin session: [[2026-09-26 - Atlas initial build and vault scaffold]]
- Related decisions: [[TDR-001 - Use d3-force for graph rendering]]
