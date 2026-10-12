# Contributing

## Setup

```bash
bun install
cp .env.example .env
bunx playwright install chromium
bun run dev
```

## Before opening a PR

```bash
bun run typecheck
bun run test
bun run test:e2e
bun run build
```

All four need to pass.

## Code style

- TypeScript, Bun, no React. Arrow functions, block bodies with explicit `return` for anything
  conditional, no implicit ternaries.
- Business logic lives in `src/tierlist/` and stays framework-free (no DOM access). UI code lives
  in `src/ui/` and `src/app/`.
- A module gets a unit test next to it (`foo.test.ts` beside `foo.ts`) when it has real logic to
  break. UI flows get covered in `tests/e2e/` instead.
- No comments that restate what the code does. A comment only earns its place when it explains a
  WHY that is not obvious from reading the code.

## Regenerating the catalog

If you change `scripts/referenceSeed.ts` or need a fresher catalog snapshot, rerun
`bun run build:catalog`. Commit the regenerated `data/*.json` and any new files under `posters/`.

## Reporting a bug

Open an issue with the steps to reproduce, what you expected, and what happened instead. A
screenshot helps more than a description when it is a rendering issue.
