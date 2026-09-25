---
title: Size nodes by degree using min-max normalization
category: technical
status: accepted
created: 2026-09-26
updated: 2026-09-26
origin_session: "[[2026-09-26 - Atlas initial build and vault scaffold]]"
tags: [decision, atlas]
---

# TDR-004 - Size nodes by degree using min-max normalization

## Context

Node size should reflect connection count, but must stay bounded and
comparative. A linear or unbounded growth formula makes hub nodes balloon.

## Decision

Normalize degree across the observed range and map it linearly to a bounded
radius: notes 8–18px, tags 5–13px. Formula:
`normalized = (degree - min) / (max - min)`, `radius = minR + normalized * (maxR - minR)`.

## Alternatives Considered

- **Linear `base + k*degree`** — rejected: unbounded for high-degree hubs.
- **Square-root growth** — rejected: still unbounded and hard to cap cleanly.

## Consequences

- The most-connected node is always the max size; the least is the min.
- Fully bounded; no node exceeds 18px.
- Cost: a single extreme hub compresses the rest toward the small end.

## Related

- Origin session: [[2026-09-26 - Atlas initial build and vault scaffold]]
- Related decisions: None
