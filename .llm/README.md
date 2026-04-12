# .llm — Project Context for LLM-Assisted Development

This directory contains structured documentation designed to give LLMs (and developers) a clear understanding of the Revive project. Point your AI assistant at these files to enable accurate, context-aware code generation.

## Structure

```
.llm/
├── requirements/        # What the product must do
│   └── PRD.md           # Product Requirements Document
├── roadmap/             # How and when we build it
│   └── ROADMAP.md       # Phased roadmap with ordered tasks
└── architecture/        # How the system is designed
    └── ARCHITECTURE.md  # System design & technical decisions
```

## Usage

- **Starting a new feature** — read `requirements/PRD.md` for acceptance criteria, then `roadmap/ROADMAP.md` for task ordering.
- **Understanding the codebase** — read `architecture/ARCHITECTURE.md` for the tech stack, data flow, and directory layout.
- **Updating plans** — keep these docs in sync as decisions are made. They are the source of truth for LLM sessions.
