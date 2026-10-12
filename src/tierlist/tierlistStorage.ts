import seedState from '../../data/seedState.json';
import type { TierlistState } from './tier';

const STORAGE_KEY = 'appletv-tierlist:state';

export const loadTierlistState = (): TierlistState => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return seedState as TierlistState;
  }
  return JSON.parse(raw) as TierlistState;
};

export const saveTierlistState = (state: TierlistState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
