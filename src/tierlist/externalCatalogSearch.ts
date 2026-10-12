import type { CatalogItem, MediaType } from './catalogItem';
import { TMDB_BASE, TMDB_IMAGE_BASE, tmdbApiKey } from './tmdbConfig';

const SEARCH_ENDPOINT: Record<MediaType, string> = {
  series: '/search/tv',
  movies: '/search/movie',
};

const TITLE_FIELD: Record<MediaType, 'name' | 'title'> = {
  series: 'name',
  movies: 'title',
};

type TmdbSearchResult = {
  id: number;
  name?: string;
  title?: string;
  poster_path: string | null;
};

export const searchExternalCatalog = async (type: MediaType, query: string): Promise<CatalogItem[]> => {
  const url = new URL(TMDB_BASE + SEARCH_ENDPOINT[type]);
  url.searchParams.set('query', query);
  url.searchParams.set('language', 'en-US');

  const response = await fetch(url, { headers: { Authorization: `Bearer ${tmdbApiKey()}` } });
  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as { results: TmdbSearchResult[] };
  const results: CatalogItem[] = [];
  for (const result of data.results) {
    const name = result[TITLE_FIELD[type]];
    if (!result.poster_path || !name) {
      continue;
    }
    results.push({ id: result.id, type, name, posterUrl: TMDB_IMAGE_BASE + result.poster_path });
  }
  return results;
};
