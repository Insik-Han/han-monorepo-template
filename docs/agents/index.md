# Agent Docs Index

This file maps repo-specific agent instructions to their source documents.

| Topic            | Summary                                                          | Source                            |
| ---------------- | ---------------------------------------------------------------- | --------------------------------- |
| Toolchain        | Vite+ unified web toolchain, `vp` commands, and review checklist | `docs/agents/vite-plus.md`        |
| Architecture     | Oxlint-enforced package/layer import boundaries                  | `docs/agents/architecture.md`     |
| ast-grep         | AST-aware structural code search and safe AI usage rules         | `docs/agents/ast-grep.md`         |
| Issue tracker    | GitHub Issues via the `gh` CLI                                   | `docs/agents/issue-tracker.md`    |
| Triage labels    | Default five-label triage vocabulary                             | `docs/agents/triage-labels.md`    |
| Domain docs      | Multi-context domain-doc layout via root `CONTEXT-MAP.md`        | `docs/agents/domain.md`           |
| Agent automation | Browser, device, and proofshot verification tools                | `docs/agents/agent-automation.md` |
| Design system    | Semantic tokens and cross-platform design rules                  | `docs/agents/design.md`           |
| Web styling      | Web styling stack, HeroUI React rules, and validation guidance   | `docs/agents/styling-web.md`      |
| Native styling   | Native styling stack, Uniwind/HeroUI Native rules, and checks    | `docs/agents/styling-native.md`   |
| i18n             | Lingui setup, locale catalogs, and string-extraction workflow    | `docs/agents/i18n.md`             |
| Testing          | Testing-trophy strategy, runner per package, and conventions     | `docs/agents/testing.md`          |
| Self-evolution   | Learnings capture, /evolve PR pipeline, allowlist, and gates     | `docs/agents/self-evolution.md`   |

When a task needs repo-specific behavior, read the relevant source document before acting.
