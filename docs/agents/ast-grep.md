# ast-grep

Use ast-grep for AST-aware structural code search when `rg` is too broad or too fragile.

Prefer `rg` first for plain text, file names, imports, simple symbols, and quick exploration. Switch to ast-grep when the task depends on code shape: function calls, JSX structure, nested expressions, imports with specific specifiers, async functions, missing wrappers, or language-aware refactors.

## Install

Check whether the CLI exists before using it:

```bash
ast-grep --help
```

If it is missing, install the CLI globally:

```bash
vp install -g @ast-grep/cli
```

For one-off use without a global install, run it through `vp dlx`:

```bash
vp dlx @ast-grep/cli --help
```

The expected binary is `ast-grep`.

## When Agents Should Use It

Use ast-grep when a search needs syntax awareness, for example:

- Find calls matching a shape, such as `useQuery($$$ARGS)` or `console.log($ARG)`.
- Find components with a specific JSX prop.
- Find functions that contain `await`.
- Find imports from a package with a particular imported name.
- Check whether a refactor would affect only the intended construct.
- Generate an exact candidate list before applying a mechanical change.

Do not use ast-grep as a replacement for every search. For simple text search, use `rg` because it is faster and easier to inspect.

## Quick Commands

Simple JavaScript or TypeScript pattern:

```bash
ast-grep run --lang ts --pattern 'console.log($ARG)' .
```

TSX or JSX component pattern:

```bash
ast-grep run --lang tsx --pattern '<$COMPONENT $PROP={$VALUE} />' apps packages
```

JSON output for scripts or reviewable candidate lists:

```bash
ast-grep run --lang ts --pattern 'useEffect($$$ARGS)' --json apps packages
```

Inspect how ast-grep parses a pattern:

```bash
ast-grep run --lang ts --pattern 'async function $NAME($$$ARGS) { $$$BODY }' --debug-query=pattern
```

## Rule Files

For anything more complex than a single pattern, create a temporary YAML rule under `tmp/` or `.scratch/`, test it on a tiny example, then run it against the repo.

Example:

```yaml
id: async-function-with-await
language: typescript
rule:
  kind: function_declaration
  has:
    pattern: await $EXPR
    stopBy: end
```

Run it with:

```bash
ast-grep scan --rule tmp/async-function-with-await.yml apps packages
```

For relational rules such as `has` and `inside`, include `stopBy: end` unless there is a specific reason to stop earlier.

## AI Usage Rules

- Start with read-only searches. Do not rewrite code until the candidate set is reviewed.
- Prefer a small example file or inline snippet when designing a new rule.
- Use `--debug-query=pattern` or `--debug-query=cst` when a rule does not match.
- Keep reusable rules only when they will be used again; otherwise keep experiments in `tmp/` or `.scratch/`.
- For mechanical edits, show or inspect the match list first, then apply a narrow patch.
- Do not run broad automatic rewrites across `apps/` and `packages/` without first confirming the intended match shape.

## Local Skill

There is also an ast-grep skill at `.agents/skills/ast-grep/SKILL.md`. Use it for deeper rule-writing guidance when the search requires complex structural matching.
