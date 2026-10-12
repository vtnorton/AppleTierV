import type { CatalogItem } from './catalogItem';

const STORAGE_KEY = 'appletv-tierlist:custom-items';

export const loadCustomItems = (): CatalogItem[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  return JSON.parse(raw) as CatalogItem[];
};

export const addCustomItem = (item: CatalogItem): void => {
  const items = loadCustomItems();
  const alreadyKnown = items.some((existing) => existing.id === item.id && existing.type === item.type);
  if (alreadyKnown) {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...items, item]));
};
