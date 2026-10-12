import type { Tier } from './tier';

export const countWatched = (tiers: Tier[]): number => {
  return tiers.reduce((sum, tier) => sum + tier.itemIds.length, 0);
};
