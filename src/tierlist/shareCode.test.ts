import { describe, expect, test } from 'bun:test';
import type { TierlistState } from './tier';
import { decodeShareCode, encodeShareCode } from './shareCode';

const STATE: TierlistState = {
  series: [{ id: 'top', name: 'Absolute Cinema', color: '#d53030', itemIds: [1, 2, 3] }],
  movies: [{ id: 'top', name: 'Watch on the theater', color: '#d53030', itemIds: [42] }],
};

describe('shareCode', () => {
  test('round-trips a tierlist state', () => {
    const code = encodeShareCode(STATE);
    expect(decodeShareCode(code)).toEqual(STATE);
  });

  test('produces a URL-safe string with no padding', () => {
    expect(encodeShareCode(STATE)).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});
