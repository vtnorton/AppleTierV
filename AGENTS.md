# Agent instructions

This app has no backend. Every tierlist lives in the browser's `localStorage`. Two ways for an
agent to drive it, both operating on that same state:

## 1. In-page API: `window.Tierlist`

Both `series.html` and `movies.html` expose this once loaded:

```ts
window.Tierlist.addItem(tierId: string, catalogId: number): void
window.Tierlist.removeItem(itemId: number): void
window.Tierlist.moveItemToAdjacentTier(tierId: string, itemId: number, direction: 'up' | 'down'): void
window.Tierlist.moveItemToTier(itemId: number, targetTierId: string): void
window.Tierlist.exportState(): string          // share code for the current state
window.Tierlist.importState(code: string): void
window.Tierlist.downloadImage(): Promise<void> // triggers the same PNG download as the UI button
```

Tier ids and catalog ids come from `data/catalog-series.json` / `data/catalog-movies.json` and the
tier list in `data/seedState.json` (or whatever the user has renamed tiers to since). This is the
exact same code path the UI buttons call, so there is no separate logic to fall out of sync with.

## 2. Headless CLI: `bun run render`

For a one-shot render without touching a real browser session:

```bash
bun run render -- --type series --out tierlist.png --actions actions.json
```

`--actions` is optional: a JSON array of `{ "fn": "...", "args": [...] }` calls matching the API
above, applied in order before the screenshot. For example:

```json
[{ "fn": "addItem", "args": ["absolute-cinema", 95396] }]
```

Internally this spins up a static file server, drives headless Chromium via Playwright, calls
`window.Tierlist.*` the same way the in-page API does, and saves the resulting download to `--out`.
Requires `bunx playwright install chromium` once.

## Adding a title that isn't in the catalog

If `addItem` doesn't recognize a `catalogId`, the title likely isn't in the pre-baked catalog yet.
The catalog is generated from TMDB; a title too new to be indexed there won't have a `catalogId` to
use. In that case, drive the UI's search box instead (it falls back to a live TMDB search), or add
the item as JSON matching the `CatalogItem` shape in `src/tierlist/catalogItem.ts` and pass it
through `customItemsStorage`.
