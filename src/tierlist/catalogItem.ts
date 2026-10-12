export type MediaType = 'series' | 'movies';

export type CatalogItem = {
  id: number;
  type: MediaType;
  name: string;
  posterUrl?: string;
};

export const catalogPosterUrl = (item: CatalogItem): string => {
  return item.posterUrl ?? `posters/${item.type}/${item.id}.jpg`;
};
