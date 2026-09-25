---
title: Link Parsing
created: 2026-09-25
updated: 2026-09-25
status: accepted
tags: [feature, atlas]
---

# Link Parsing

Parses three link types into nodes and edges: `[[wikilinks]]`, `#tags`, and
`[label](target)` Markdown links. Implemented as pure `LinkExtractor` strategies
in the domain layer (no framework imports). Targets are resolved to existing
notes by id or basename; unresolved links and tags become their own nodes.

Related: [[Functional Specification (FSD)]]
