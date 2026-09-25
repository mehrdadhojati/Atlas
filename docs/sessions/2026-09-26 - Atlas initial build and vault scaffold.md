---
title: Atlas initial build and vault scaffold
date: 2026-09-26
tags: [session, atlas]
---

# Atlas initial build and vault scaffold

## Participants
- Human: Mehrdad Hojati
- Agent: Agentic Engineer Lead

## Discussion Summary

Built the Atlas VS Code extension end to end: layered TypeScript architecture,
Markdown link parsing (wikilinks, tags, Markdown links), a d3-force canvas
renderer in a webview, and interactions (drag, hover/click highlight,
double-click open, zoom/pan). Established degree-based node sizing, versioning,
and packaging as a `.vsix`. Scaffolded the second-brain vault with system and
software architecture, specifications, decision records, templates, and feature
documentation.

## Decisions Made
- [[ADR-001 - Adopt layered architecture with a pure domain core]]
- [[ADR-002 - Use a typed message bus and plain GraphData for host-webview communication]]
- [[TDR-001 - Use d3-force for graph rendering]]
- [[TDR-002 - Use esbuild as the bundler]]
- [[TDR-003 - Use vitest for domain unit testing]]
- [[TDR-004 - Size nodes by degree using min-max normalization]]
- [[TDR-005 - Adopt semantic versioning for the extension]]

## Outcomes & Follow-ups
- Extension at v1.0.5, buildable, typechecked, and tested.
- Features documented in `features/`.
- Follow-ups tracked in [[TODO]] and [[Backlog]] (repackage `.vsix`, verify
  split-open behavior, consider clustering).
