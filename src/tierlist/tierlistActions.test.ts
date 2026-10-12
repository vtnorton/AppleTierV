import { describe, expect, test } from 'bun:test';
import type { TierlistState } from './tier';
import { addItemToTier, moveItemToAdjacentTier, moveItemToTier, removeItem, renameTier } from './tierlistActions';

const baseState = (): TierlistState => {
  return {
    series: [
      { id: 'top', name: 'Top', color: '#d53030', itemIds: [1, 2] },
      { id: 'mid', name: 'Mid', color: '#f59e0b', itemIds: [] },
      { id: 'bottom', name: 'Bottom', color: '#3b82f6', itemIds: [] },
    ],
    movies: [{ id: 'top', name: 'Top', color: '#d53030', itemIds: [] }],
  };
};

describe('addItemToTier', () => {
  test('appends the item to the target tier', () => {
    const next = addItemToTier(baseState(), 'series', 'bottom', 42);
    expect(next.series[2]!.itemIds).toEqual([42]);
  });

  test('is idempotent when the item is already in the tier', () => {
    const next = addItemToTier(baseState(), 'series', 'top', 1);
    expect(next.series[0]!.itemIds).toEqual([1, 2]);
  });

  test('does not touch the other media type', () => {
    const next = addItemToTier(baseState(), 'series', 'bottom', 42);
    expect(next.movies).toEqual(baseState().movies);
  });
});

describe('removeItem', () => {
  test('removes the item from whichever tier holds it', () => {
    const next = removeItem(baseState(), 'series', 1);
    expect(next.series[0]!.itemIds).toEqual([2]);
  });
});

describe('moveItemToTier', () => {
  test('moves the item from its current tier to the target tier', () => {
    const next = moveItemToTier(baseState(), 'series', 1, 'bottom');
    expect(next.series[0]!.itemIds).toEqual([2]);
    expect(next.series[2]!.itemIds).toEqual([1]);
  });
});

describe('renameTier', () => {
  test('renames only the target tier', () => {
    const next = renameTier(baseState(), 'series', 'top', 'Peak Cinema');
    expect(next.series[0]!.name).toBe('Peak Cinema');
    expect(next.series[1]!.name).toBe('Mid');
  });
});

describe('moveItemToAdjacentTier', () => {
  test('moving down relocates the item to the tier below', () => {
    const next = moveItemToAdjacentTier(baseState(), 'series', 'top', 1, 'down');
    expect(next.series[0]!.itemIds).toEqual([2]);
    expect(next.series[1]!.itemIds).toEqual([1]);
    expect(next.series[2]!.itemIds).toEqual([]);
  });

  test('moving up relocates the item to the tier above', () => {
    const withItemInMid = moveItemToTier(baseState(), 'series', 1, 'mid');
    const next = moveItemToAdjacentTier(withItemInMid, 'series', 'mid', 1, 'up');
    expect(next.series[0]!.itemIds).toEqual([2, 1]);
    expect(next.series[1]!.itemIds).toEqual([]);
  });

  test('is a no-op at the top boundary', () => {
    const next = moveItemToAdjacentTier(baseState(), 'series', 'top', 1, 'up');
    expect(next.series[0]!.itemIds).toEqual([1, 2]);
  });

  test('is a no-op at the bottom boundary', () => {
    const next = moveItemToAdjacentTier(baseState(), 'series', 'bottom', 1, 'down');
    expect(next).toEqual(baseState());
  });
});
