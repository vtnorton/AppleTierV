import type { MediaType } from './catalogItem';
import type { Tier, TierlistState } from './tier';

type MoveDirection = 'up' | 'down';

const withTiers = (state: TierlistState, type: MediaType, tiers: Tier[]): TierlistState => {
  if (type === 'series') {
    return { ...state, series: tiers };
  }
  return { ...state, movies: tiers };
};

export const addItemToTier = (
  state: TierlistState,
  type: MediaType,
  tierId: string,
  itemId: number,
): TierlistState => {
  const tiers = state[type].map((tier) => {
    if (tier.id !== tierId || tier.itemIds.includes(itemId)) {
      return tier;
    }
    return { ...tier, itemIds: [...tier.itemIds, itemId] };
  });
  return withTiers(state, type, tiers);
};

export const removeItem = (state: TierlistState, type: MediaType, itemId: number): TierlistState => {
  const tiers = state[type].map((tier) => {
    return { ...tier, itemIds: tier.itemIds.filter((id) => id !== itemId) };
  });
  return withTiers(state, type, tiers);
};

export const moveItemToTier = (
  state: TierlistState,
  type: MediaType,
  itemId: number,
  targetTierId: string,
): TierlistState => {
  const withoutItem = removeItem(state, type, itemId);
  return addItemToTier(withoutItem, type, targetTierId, itemId);
};

export const renameTier = (state: TierlistState, type: MediaType, tierId: string, name: string): TierlistState => {
  const tiers = state[type].map((tier) => {
    if (tier.id !== tierId) {
      return tier;
    }
    return { ...tier, name };
  });
  return withTiers(state, type, tiers);
};

export const moveItemToAdjacentTier = (
  state: TierlistState,
  type: MediaType,
  tierId: string,
  itemId: number,
  direction: MoveDirection,
): TierlistState => {
  const tiers = state[type];
  const currentIndex = tiers.findIndex((tier) => tier.id === tierId);
  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (currentIndex === -1 || targetIndex < 0 || targetIndex >= tiers.length) {
    return state;
  }

  return moveItemToTier(state, type, itemId, tiers[targetIndex]!.id);
};
