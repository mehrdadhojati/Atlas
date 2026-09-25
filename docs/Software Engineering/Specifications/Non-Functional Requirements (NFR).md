---
title: Non-Functional Requirements (NFR)
created: 2026-09-26
updated: 2026-09-26
status: accepted
tags: [specification, atlas]
---

# Non-Functional Requirements (NFR) — Atlas

## 1. Performance

- The graph must render and respond to interaction within a few milliseconds for
  typical vaults (up to a few hundred nodes).
- Rendering uses `requestAnimationFrame`; simulation is re-heated only while
  dragging.

## 2. Scalability

- Parsing must be linear in the number of files and links.
- For very large vaults, rendering may degrade gracefully; clustering is a
  deferred enhancement (see [[Backlog]]).

## 3. Reliability & Availability

- Runs locally with no network dependency; availability is bounded by VS Code.
- A failure in one file's parsing must not break the whole graph.

## 4. Security

- The webview runs sandboxed with `enableCommandUris: false` and restricted
  `localResourceRoots`.
- A strict Content-Security-Policy (nonce-based) disallows remote content.
- Markdown note titles are treated as untrusted data and rendered as canvas text,
  never injected as HTML.

## 5. Usability & Accessibility

- Interactions are discoverable (hover, click, double-click, wheel, drag).
- Labels remain readable at all zoom levels.
- Colors adapt to light/dark themes.

## 6. Maintainability

- Layered architecture with a pure, unit-tested domain core.
- Strict TypeScript and JSDoc on public APIs.
- Documented via this vault (ADR/TDR, FSD, NFR, feature docs).

## 7. Portability & Compatibility

- Targets the current stable VS Code engine (`^1.85.0`).
- Works on all platforms VS Code supports (Node extension host + webview).

## 8. Observability

- Failures are surfaced (fail fast and loud) rather than swallowed.
- Webview errors are visible in the developer tools console.

## 9. Recoverability & Backup

- The graph is a projection of workspace files; no state needs recovery.
- Re-running the command rebuilds the graph from disk.

## 10. Compliance & Privacy

- No data leaves the local machine; no telemetry or analytics.
- No credentials or secrets are stored or transmitted.
