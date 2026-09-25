---
title: <Feature Name>
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: accepted
tags: [feature, atlas]
---

# <Feature Name>

## Requirements & Specification
<What the feature must do.>

## UI Design
<How the feature appears and is interacted with.>

## System Design — DFD
```mermaid
flowchart LR
    A[Source] -->|data| B[Component]
    B -->|output| C[Destination]
```

## Workflow Diagram
```mermaid
flowchart TD
    S[Start] --> A[Action]
    A --> E[End]
```

## Data Model & Message Contracts
```mermaid
classDiagram
    class Model {
        field: type
    }
```

## Validation
<Input/state checks and their outcomes.>

## Exception Handling
<How failures are surfaced and recovered from.>
