import path from 'node:path';
import { normalizeTitle } from '../src/tierlist/catalogIndex';
import type { CatalogItem, MediaType } from '../src/tierlist/catalogItem';
import type { ReferenceSeed, ReferenceTier } from './seedStateBuilder';
import { readReferenceSeed, writeReferenceSeed, writeSeedState } from './seedStateBuilder';

const DATA_DIR = path.join(import.meta.dir, '..', 'data');
const SUGGESTION_LIMIT = 5;
const USAGE = 'Usage: bun run add -- --type series|movies --tier <tier-id> --title "Exact Title"';

type Arguments = {
  type: MediaType;
  tierId: string;
  title: string;
};

const parseArguments = (): Arguments => {
  const argv = process.argv.slice(2);
  const flag = (name: string): string | undefined => {
    const index = argv.indexOf(name);
    if (index === -1) {
      return undefined;
    }
    return argv[index + 1];
  };

  const type = flag('--type');
  const tierId = flag('--tier');
  const title = flag('--title');
  if (type !== 'series' && type !== 'movies') {
    throw new Error(USAGE);
  }
  if (!tierId || !title) {
    throw new Error(USAGE);
  }
  return { type, tierId, title };
};

const isCatalogEntry = (value: unknown): value is { id: number; name: string } => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  return 'id' in value && typeof value.id === 'number' && 'name' in value && typeof value.name === 'string';
};

const readCatalog = async (type: MediaType): Promise<CatalogItem[]> => {
  const catalogPath = path.join(DATA_DIR, `catalog-${type}.json`);
  const parsed: unknown = JSON.parse(await Bun.file(catalogPath).text());
  if (!Array.isArray(parsed)) {
    throw new Error(`${catalogPath} is not a catalog. Run "bun run build:catalog".`);
  }
  return parsed.filter(isCatalogEntry).map((entry) => {
    return { id: entry.id, type, name: entry.name };
  });
};

const findTier = (tiers: ReferenceTier[], tierId: string): ReferenceTier => {
  const tier = tiers.find((candidate) => candidate.id === tierId);
  if (!tier) {
    const available = tiers.map((candidate) => candidate.id).join(', ');
    throw new Error(`Unknown tier "${tierId}". Available: ${available}`);
  }
  return tier;
};

const findCatalogItem = (catalog: CatalogItem[], title: string): CatalogItem => {
  const normalizedTitle = normalizeTitle(title);
  const match = catalog.find((item) => normalizeTitle(item.name) === normalizedTitle);
  if (match) {
    return match;
  }

  const suggestions = catalog
    .filter((item) => normalizeTitle(item.name).includes(normalizedTitle))
    .slice(0, SUGGESTION_LIMIT)
    .map((item) => `"${item.name}"`);
  if (suggestions.length > 0) {
    throw new Error(`No exact match for "${title}". Did you mean: ${suggestions.join(', ')}?`);
  }
  throw new Error(`"${title}" is not in the catalog. Run "bun run build:catalog" to pull newer Apple TV+ titles.`);
};

const placeTitle = (seed: ReferenceSeed, type: MediaType, tierId: string, title: string): ReferenceSeed => {
  const normalizedTitle = normalizeTitle(title);
  const tiers = seed[type].map((tier) => {
    const items = tier.items.filter((item) => normalizeTitle(item) !== normalizedTitle);
    if (tier.id !== tierId) {
      return { ...tier, items };
    }
    return { ...tier, items: [...items, title] };
  });

  if (type === 'series') {
    return { ...seed, series: tiers };
  }
  return { ...seed, movies: tiers };
};

const run = async (): Promise<void> => {
  const { type, tierId, title } = parseArguments();
  const seed = await readReferenceSeed();
  const catalogs = { series: await readCatalog('series'), movies: await readCatalog('movies') };

  const tier = findTier(seed[type], tierId);
  const item = findCatalogItem(catalogs[type], title);
  const nextSeed = placeTitle(seed, type, tier.id, item.name);

  await writeReferenceSeed(nextSeed);
  await writeSeedState(nextSeed, catalogs);
  console.log(`${item.name} -> ${tier.name} (${type})`);
};

await run();
