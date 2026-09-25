---
name: second-brain
description: Use when reading from or writing to the project's second-brain documentation in docs/, recording engineering decisions (ADR/TDR), updating specs (FSD/NFR/architecture), logging discussion sessions, or maintaining the TODO/Backlog/README. Triggers: "update the docs", "record this decision", "log this session", "update the FSD/NFR", "second brain".
---

# Second Brain

Procedures for maintaining the project's second brain (engineering documentation
in `docs/`). This skill provides the step-by-step "how".

## Docs root

`C:\Mine\Programming\Grapher\docs`

Always operate relative to this root. Read a file before editing it.

## Procedure: Record a decision (ADR or TDR)

1. Determine type:
   - Architectural (structure, boundaries, interfaces, patterns) → **ADR**
   - Everything else (library, UI, workflow, process, content) → **TDR**
2. Determine the next sequential number (read existing records in
   `Software Engineering/decisions/`).
3. Create `Software Engineering/decisions/ADR-### - <Full Title>.md` (or `TDR-###`).
4. Use the template below. Set `category`, `status`, `origin_session`.
5. Link `origin_session` to the `sessions/` file that produced the decision.

### ADR/TDR template

````markdown
---
title: <Full Descriptive Title>
category: architecture | technical | process | content
status: proposed | accepted | superseded | deprecated
created: YYYY-MM-DD
updated: YYYY-MM-DD
superseded_by: (only when superseded/deprecated)
origin_session: "[[YYYY-MM-DD - <Topic>]]"
tags: [<tags>]
---

# ADR-### - <Full Descriptive Title>

## Context
<Background, constraints, and what forces the decision.>

## Decision
<The decision taken, stated clearly and specifically.>

## Alternatives Considered
<Options that were evaluated and why they were rejected.>

## Consequences
<Positive and negative outcomes, risks, and follow-ups.>

## Related
- Origin session: [[YYYY-MM-DD - <Topic>]]
- Related decisions: [[...]]
````

## Procedure: Update a living spec (FSD / NFR / Architecture)

1. Read the target spec file to get its current state.
2. Apply the change in place (these documents evolve).
3. Update the `updated:` frontmatter date.
4. Add or update a Mermaid diagram inline (never an image file).
5. Link any relevant ADR/TDR and the originating session.
6. Update `TODO.md` (last action) and `Backlog.md` (pending items).

## Procedure: Log a session

1. Create `sessions/YYYY-MM-DD - <Topic>.md`.
2. Use the template below.
3. For each decision made, create the corresponding ADR/TDR and link back here.

### Session template

````markdown
---
title: <Topic>
date: YYYY-MM-DD
tags: [session]
---

# <Topic>

## Participants
- Human: Mehrdad
- Agent: <role>

## Discussion Summary
<Concise summary of the meaningful discussion.>

## Decisions Made
- [[ADR-### - <Title>]]
- [[TDR-### - <Title>]]

## Outcomes & Follow-ups
<What changed, what is pending — mirrored into TODO.md / Backlog.md.>
````

## Procedure: Update operational files

- `README.md` — only when structure or onboarding changes (rare).
- `TODO.md` — after EVERY meaningful session: set "Last action" and "Next actions".
- `Backlog.md` — add/remove pending decisions, actions, and implementation items.

### TODO.md structure

````markdown
# TODO

## Last Action
<One or two lines describing what was just completed.>

## Next Actions
- [ ] <immediate next step> → [[owning document]]
- [ ] <immediate next step> → [[owning document]]
````

### Backlog.md structure

````markdown
# Backlog

## Pending Decisions
- [ ] <decision to be made> → [[related document]]

## Pending Actions
- [ ] <action to take> → [[related document]]

## Pending Implementation
- [ ] <feature/change to build> → [[related document]]
````

## Procedure: FSD feature section

When adding a feature to the FSD, insert under `## Functional Requirements` and
include all seven subsections in order:

1. Requirements & Specification
2. UI Design (if applicable)
3. System Design — DFD (` ```mermaid flowchart `)
4. Workflow Diagram (` ```mermaid flowchart `)
5. Data Model & Message Contracts (` ```mermaid classDiagram ` + field table)
6. Validation
7. Exception Handling

## Procedure: Verify

After any docs write:
- Confirm frontmatter is present and correct.
- Confirm all diagrams are Mermaid blocks.
- Confirm links (`[[...]]`) resolve to existing files.
- Confirm TODO.md and Backlog.md are updated.
