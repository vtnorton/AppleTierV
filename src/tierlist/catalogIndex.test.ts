import { describe, expect, test } from 'bun:test';
import type { CatalogItem } from './catalogItem';
import { buildCatalogIndex, findCatalogItem, normalizeTitle, searchCatalog } from './catalogIndex';

const ITEMS: CatalogItem[] = [
  { id: 1, type: 'series', name: 'Severance' },
  { id: 2, type: 'series', name: 'The Morning Show' },
  { id: 3, type: 'series', name: "Margo's Got Money Troubles" },
];

describe('normalizeTitle', () => {
  test('lowercases and strips punctuation', () => {
    expect(normalizeTitle("Margo's Got Money Troubles!")).toBe('margo s got money troubles');
  });
});

describe('findCatalogItem', () => {
  test('finds an item by id in O(1)', () => {
    const index = buildCatalogIndex(ITEMS);
    expect(findCatalogItem(index, 2)).toEqual(ITEMS[1]!);
  });

  test('returns undefined for an unknown id', () => {
    const index = buildCatalogIndex(ITEMS);
    expect(findCatalogItem(index, 999)).toBeUndefined();
  });
});

describe('searchCatalog', () => {
  test('matches by partial, case-insensitive title', () => {
    const index = buildCatalogIndex(ITEMS);
    expect(searchCatalog(index, 'morning', 10)).toEqual([ITEMS[1]!]);
  });

  test('respects the result limit', () => {
    const index = buildCatalogIndex(ITEMS);
    expect(searchCatalog(index, '', 10)).toEqual([]);
    expect(searchCatalog(index, 'e', 1)).toHaveLength(1);
  });
});
