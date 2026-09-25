---
title: Live Refresh
created: 2026-09-25
updated: 2026-09-25
status: accepted
tags: [feature, atlas]
---

# Live Refresh

A file-system watcher observes Markdown file create/change/delete events and
re-indexes the graph (debounced 500ms), pushing fresh data to the webview
without manual reload.

Related: [[Functional Specification (FSD)]]
