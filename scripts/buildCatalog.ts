import path from 'node:path';
import type { CatalogItem, MediaType } from '../src/tierlist/catalogItem';
import { APPLE_TV_PROVIDER_ID, TMDB_BASE, TMDB_IMAGE_BASE, WATCH_REGION, tmdbApiKey } from '../src/tierlist/tmdbConfig';
import { readReferenceSeed, writeSeedState } from './seedStateBuilder';

const POSTER_DOWNLOAD_CONCURRENCY = 8;

const DATA_DIR = path.join(import.meta.dir, '..', 'data');
const POSTERS_DIR = path.join(import.meta.dir, '..', 'posters');

const DISCOVER_ENDPOINT: Record<MediaType, string> = {
  series: '/discover/tv',
  movies: '/discover/movie',
};

const TITLE_FIELD: Record<MediaType, 'name' | 'title'> = {
  series: 'name',
  movies: 'title',
};

type TmdbResult = {
  id: number;
  name?: string;
  title?: string;
  poster_path: string | null;
};

type TmdbDiscoverResponse = {
  total_pages: number;
  results: TmdbResult[];
};

type FetchedCatalog = {
  items: CatalogItem[];
  posterPathById: Map<number, string>;
};

const tmdbGet = async (endpoint: string, params: Record<string, string>): Promise<TmdbDiscoverResponse> => {
  const url = new URL(TMDB_BASE + endpoint);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${tmdbApiKey()}`, Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`TMDB request failed (${response.status}): ${url}`);
  }
  return (await response.json()) as TmdbDiscoverResponse;
};

const fetchCatalog = async (type: MediaType): Promise<FetchedCatalog> => {
  const items: CatalogItem[] = [];
  const posterPathById = new Map<number, string>();
  let page = 1;
  let totalPages = 1;

  do {
    const data = await tmdbGet(DISCOVER_ENDPOINT[type], {
      with_watch_providers: String(APPLE_TV_PROVIDER_ID),
      watch_region: WATCH_REGION,
      language: 'en-US',
      page: String(page),
    });
    totalPages = data.total_pages;

    for (const result of data.results) {
      const name = result[TITLE_FIELD[type]];
      if (!result.poster_path || !name) {
        continue;
      }
      items.push({ id: result.id, type, name });
      posterPathById.set(result.id, result.poster_path);
    }
    page += 1;
  } while (page <= totalPages);

  return { items, posterPathById };
};

const mapWithConcurrency = async <T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> => {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  const worker = async (): Promise<void> => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await fn(items[currentIndex]!);
    }
  };

  await Promise.all(Array.from({ length: limit }, worker));
  return results;
};

const downloadPoster = async (item: CatalogItem, posterPath: string): Promise<void> => {
  const destination = path.join(POSTERS_DIR, item.type, `${item.id}.jpg`);
  if (await Bun.file(destination).exists()) {
    return;
  }
  const response = await fetch(TMDB_IMAGE_BASE + posterPath);
  if (!response.ok) {
    console.warn(`  [skip] poster for "${item.name}" (${response.status})`);
    return;
  }
  await Bun.write(destination, await response.arrayBuffer());
};

const run = async (): Promise<void> => {
  const catalogsByType: Record<MediaType, CatalogItem[]> = { series: [], movies: [] };

  for (const type of ['series', 'movies'] as const) {
    console.log(`=== fetching ${type} catalog (Apple TV+, ${WATCH_REGION}) ===`);
    const { items, posterPathById } = await fetchCatalog(type);
    catalogsByType[type] = items;
    console.log(`  ${items.length} titles with posters`);

    await Bun.write(path.join(DATA_DIR, `catalog-${type}.json`), JSON.stringify(items, null, 2));

    console.log('  downloading posters...');
    await mapWithConcurrency(items, POSTER_DOWNLOAD_CONCURRENCY, async (item) => {
      await downloadPoster(item, posterPathById.get(item.id)!);
    });
  }

  console.log('=== building seed tierlist state ===');
  await writeSeedState(await readReferenceSeed(), catalogsByType);

  console.log('done.');
};

await run();
