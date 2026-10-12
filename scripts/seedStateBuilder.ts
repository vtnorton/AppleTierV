import path from 'node:path';
import { normalizeTitle } from '../src/tierlist/catalogIndex';
import type { CatalogItem, MediaType } from '../src/tierlist/catalogItem';
import type { Tier, TierlistState } from '../src/tierlist/tier';

const DATA_DIR = path.join(import.meta.dir, '..', 'data');
const REFERENCE_SEED_PATH = path.join(DATA_DIR, 'referenceSeed.json');
const SEED_STATE_PATH = path.join(DATA_DIR, 'seedState.json');

export type ReferenceTier = {
  id: string;
  name: string;
  color: string;
  items: string[];
};

export type ReferenceSeed = {
  series: ReferenceTier[];
  movies: ReferenceTier[];
};

const isReferenceTier = (value: unknown): value is ReferenceTier => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const hasIdentity = 'id' in value && typeof value.id === 'string' && 'name' in value && typeof value.name === 'string';
  const hasColor = 'color' in value && typeof value.color === 'string';
  if (!hasIdentity || !hasColor || !('items' in value) || !Array.isArray(value.items)) {
    return false;
  }
  return value.items.every((item) => typeof item === 'string');
};

const isReferenceSeed = (value: unknown): value is ReferenceSeed => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  if (!('series' in value) || !('movies' in value)) {
    return false;
  }
  const { series, movies } = value;
  return Array.isArray(series) && series.every(isReferenceTier) && Array.isArray(movies) && movies.every(isReferenceTier);
};

const resolveTier = (tier: ReferenceTier, catalog: CatalogItem[], type: MediaType): Tier => {
  const byNormalizedName = new Map(catalog.map((item) => [normalizeTitle(item.name), item]));

  const itemIds: number[] = [];
  for (const title of tier.items) {
    const match = byNormalizedName.get(normalizeTitle(title));
    if (!match) {
      console.warn(`  [unmatched] "${title}" (${type}) is not in the catalog`);
      continue;
    }
    itemIds.push(match.id);
  }
  return { id: tier.id, name: tier.name, color: tier.color, itemIds };
};

export const readReferenceSeed = async (): Promise<ReferenceSeed> => {
  const parsed: unknown = JSON.parse(await Bun.file(REFERENCE_SEED_PATH).text());
  if (!isReferenceSeed(parsed)) {
    throw new Error(`${REFERENCE_SEED_PATH} is not a reference seed.`);
  }
  return parsed;
};

export const writeReferenceSeed = async (seed: ReferenceSeed): Promise<void> => {
  await Bun.write(REFERENCE_SEED_PATH, `${JSON.stringify(seed, null, 2)}\n`);
};

export const writeSeedState = async (
  seed: ReferenceSeed,
  catalogs: Record<MediaType, CatalogItem[]>,
): Promise<void> => {
  const state: TierlistState = {
    series: seed.series.map((tier) => resolveTier(tier, catalogs.series, 'series')),
    movies: seed.movies.map((tier) => resolveTier(tier, catalogs.movies, 'movies')),
  };
  await Bun.write(SEED_STATE_PATH, `${JSON.stringify(state, null, 2)}\n`);
};
