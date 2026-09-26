---
title: Note Search
created: 2026-09-26
updated: 2026-09-26
status: accepted
tags: [feature, atlas]
---

# Note Search

A search overlay in the top-right of the graph (next to the version badge) filters
notes by display name — case-insensitive, full or partial match. Results appear in
a dropdown beneath the input, each showing the note name followed by its containing
folder (e.g. `Readme — Docs`).

Navigation is keyboard and pointer driven. Up/Down arrows move through the list and
preview (highlight) the matching node without focusing it; hovering a result does
the same. Selecting a result (Enter or click) focuses the node — persistent
highlight plus centering the viewport on it.

Search runs entirely in the webview against the already-loaded `GraphData`; it
never round-trips to the extension host, so `GraphService` stays unchanged
(Open/Closed).

Related: [[Functional Specification (FSD)]]
