import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/series.html');
  await page.waitForFunction(() => typeof window.Tierlist !== 'undefined');
});

test('renders the seeded tiers with posters and a progress bar', async ({ page }) => {
  await expect(page.locator('.tier-row')).toHaveCount(7);
  await expect(page.locator('.item-card').first().locator('img')).toBeVisible();
  await expect(page.locator('.progress-bar__label')).toContainText('/');
});

test('search finds a catalog title and adds it to the chosen tier', async ({ page }) => {
  const neutralItems = page.locator('[data-tier-id="neutral"] .item-card');
  const countBefore = await neutralItems.count();

  await page.locator('.search-panel__input').fill('Foundation');
  const resultRow = page.locator('.search-panel__row', { hasText: 'Foundation' }).first();
  await expect(resultRow).toBeVisible();
  await resultRow.locator('.search-panel__tier-select').selectOption('neutral');

  await expect(neutralItems).toHaveCount(countBefore + 1);
});

test('hovering a card reveals delete and move controls that work', async ({ page }) => {
  const items = page.locator('[data-tier-id="absolute-cinema"] .item-card');
  const cardCountBefore = await items.count();

  await items.first().hover();
  await items.first().getByTitle('Remove').click();

  await expect(items).toHaveCount(cardCountBefore - 1);
});

test('moving a card up relocates it to the tier above', async ({ page }) => {
  const sourceTier = page.locator('[data-tier-id="made-my-friend-watch"] .item-card');
  const targetTier = page.locator('[data-tier-id="absolute-cinema"] .item-card');
  const sourceCountBefore = await sourceTier.count();
  const targetCountBefore = await targetTier.count();
  const movedName = await sourceTier.first().locator('img').getAttribute('alt');

  await sourceTier.first().hover();
  await sourceTier.first().getByTitle('Move to the tier above').click();

  await expect(sourceTier).toHaveCount(sourceCountBefore - 1);
  await expect(targetTier).toHaveCount(targetCountBefore + 1);
  await expect(targetTier.last().locator('img')).toHaveAttribute('alt', movedName ?? '');
});

test('the top tier cannot move cards further up', async ({ page }) => {
  const topTierCard = page.locator('[data-tier-id="absolute-cinema"] .item-card').first();
  await topTierCard.hover();
  await expect(topTierCard.getByTitle('Move to the tier above')).toBeDisabled();
});

test('renaming a tier persists after reload', async ({ page }) => {
  const nameField = page.locator('[data-tier-id="neutral"] .tier-row__name');
  await nameField.fill('Mid Tier');
  await nameField.blur();

  await page.reload();
  await expect(page.locator('[data-tier-id="neutral"] .tier-row__name')).toHaveText('Mid Tier');
});

test('exporting and importing a share code round-trips the state', async ({ page }) => {
  const code = await page.evaluate(() => window.Tierlist.exportState());
  expect(code.length).toBeGreaterThan(0);

  await page.evaluate((exported) => window.Tierlist.importState(exported), code);
  const reimported = await page.evaluate(() => window.Tierlist.exportState());
  expect(reimported).toBe(code);
});

test('downloading the tierlist saves a PNG', async ({ page }) => {
  const downloadPromise = page.waitForEvent('download');
  await page.locator('button', { hasText: 'Download PNG' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('apple-tv-series-tierlist.png');
});
