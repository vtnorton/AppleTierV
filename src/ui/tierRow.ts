import { findCatalogItem } from '../tierlist/catalogIndex';
import type { CatalogIndex } from '../tierlist/catalogIndex';
import type { Tier } from '../tierlist/tier';
import { createItemCard } from './itemCard';

type MoveDirection = 'up' | 'down';

type TierRowCallbacks = {
  onRename: (name: string) => void;
  onRemoveItem: (itemId: number) => void;
  onMoveItem: (itemId: number, direction: MoveDirection) => void;
};

type TierRowPosition = {
  isFirstTier: boolean;
  isLastTier: boolean;
};

const createTierLabel = (tier: Tier, callbacks: TierRowCallbacks): HTMLElement => {
  const label = document.createElement('div');
  label.className = 'tier-row__label';
  label.style.background = tier.color;

  const name = document.createElement('div');
  name.className = 'tier-row__name';
  name.contentEditable = 'true';
  name.spellcheck = false;
  name.textContent = tier.name;
  name.addEventListener('blur', () => callbacks.onRename(name.textContent?.trim() || tier.name));
  name.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      name.blur();
    }
  });
  label.appendChild(name);

  return label;
};

export const createTierRow = (
  tier: Tier,
  catalogIndex: CatalogIndex,
  position: TierRowPosition,
  callbacks: TierRowCallbacks,
): HTMLElement => {
  const row = document.createElement('div');
  row.className = 'tier-row';
  row.dataset.tierId = tier.id;
  row.appendChild(createTierLabel(tier, callbacks));

  const cards = document.createElement('div');
  cards.className = 'tier-row__cards';
  for (const itemId of tier.itemIds) {
    const item = findCatalogItem(catalogIndex, itemId);
    if (!item) {
      continue;
    }
    cards.appendChild(
      createItemCard(item, {
        canMoveUp: !position.isFirstTier,
        canMoveDown: !position.isLastTier,
        onRemove: () => callbacks.onRemoveItem(itemId),
        onMoveUp: () => callbacks.onMoveItem(itemId, 'up'),
        onMoveDown: () => callbacks.onMoveItem(itemId, 'down'),
      }),
    );
  }
  row.appendChild(cards);

  return row;
};
