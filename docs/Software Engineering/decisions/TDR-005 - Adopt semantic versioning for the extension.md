---
title: Adopt semantic versioning for the extension
category: process
status: accepted
created: 2026-09-26
updated: 2026-09-26
origin_session: "[[2026-09-26 - Atlas initial build and vault scaffold]]"
tags: [decision, atlas]
---

# TDR-005 - Adopt semantic versioning for the extension

## Context

The extension version must be a valid semver for `vsce package`. A proposed
4-part version (`1.0.0.4`) is not valid semver.

## Decision

Use strict 3-part semver (`MAJOR.MINOR.PATCH`) in `package.json` as the single
source of truth. The value is read at activation
(`context.extension.packageJSON.version`) and displayed in the webview, so the
version is never duplicated.

## Alternatives Considered

- **4-part version** — rejected: `vsce` and npm require 3-part semver.
- **Build metadata in a separate field** — rejected as unnecessary.

## Consequences

- Bumping the version edits exactly one field.
- The webview badge always matches the packaged version.
- Cost: none; semver is the ecosystem standard.

## Related

- Origin session: [[2026-09-26 - Atlas initial build and vault scaffold]]
- Related decisions: None
