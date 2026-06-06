# Evolution PR body template

```markdown
## Self-evolution

- [ ] **Self-modifying**: this PR changes the evolution engine (settings/hooks/packages/evolution/ci.yml) — ADR included at `docs/adr/NNNN-*.md`

### Learnings consumed

| Hash | Target | Rationale (quoted) | Action |
| ---- | ------ | ------------------ | ------ |
| `25361fb7` | `docs/agents/testing.md` | "..." | applied / rejected: <reason> |

### Changed targets

- `docs/agents/<file>.md` — <one-line summary of the edit>

### New skills

- _none_ <!-- or: `.agents/skills/<name>/` + runtime symlinks -->

### Out of scope

- _none_ <!-- suggestions touching non-allowlisted files, for human follow-up -->

### Semantic eval

- _not run_ <!-- or: scenario scores before → after -->

### Rollback

Single squashed commit — revert with `git revert <merge commit>`.
```

Notes:

- Quote each rationale verbatim from `docs/agents/learnings.md` so reviewers can audit the chain.
- `Action: rejected` entries must still be flipped to `digested` in the diff.
