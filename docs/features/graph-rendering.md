---
title: Graph Rendering
created: 2026-09-25
updated: 2026-09-25
status: accepted
tags: [feature, atlas]
---

# Graph Rendering

Renders the workspace's Markdown notes as a live, force-directed graph. Nodes
represent notes (colored by folder) and tags (orange); edges represent links.
Uses `d3-force` physics drawn on an HTML `<canvas>`. Links are always visible.

Related: [[Functional Specification (FSD)]]
