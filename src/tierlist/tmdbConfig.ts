export const TMDB_BASE = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
export const APPLE_TV_PROVIDER_ID = 350;
export const WATCH_REGION = 'BR';

export const tmdbApiKey = (): string => {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error('TMDB_API_KEY is not set: copy .env.example to .env and fill in your TMDB API read access token.');
  }
  return apiKey;
};
