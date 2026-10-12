import type { CatalogItem } from './catalogItem';

export type CatalogIndex = {
  items: CatalogItem[];
  byId: Map<number, CatalogItem>;
};

export const normalizeTitle = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
};

export const buildCatalogIndex = (items: CatalogItem[]): CatalogIndex => {
  const byId = new Map<number, CatalogItem>();
  for (const item of items) {
    byId.set(item.id, item);
  }
  return { items, byId };
};

export const findCatalogItem = (index: CatalogIndex, id: number): CatalogItem | undefined => {
  return index.byId.get(id);
};

export const searchCatalog = (index: CatalogIndex, query: string, limit: number): CatalogItem[] => {
  const normalizedQuery = normalizeTitle(query);
  if (!normalizedQuery) {
    return [];
  }

  const matches: CatalogItem[] = [];
  for (const item of index.items) {
    if (!normalizeTitle(item.name).includes(normalizedQuery)) {
      continue;
    }
    matches.push(item);
    if (matches.length >= limit) {
      break;
    }
  }
  return matches;
};
