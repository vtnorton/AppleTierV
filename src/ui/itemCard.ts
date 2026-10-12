import { catalogPosterUrl } from '../tierlist/catalogItem';
import type { CatalogItem } from '../tierlist/catalogItem';
import { createIcon } from './icons';
import type { IconName } from './icons';

type ItemCardCallbacks = {
  canMoveUp: boolean;
  canMoveDown: boolean;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

const createIconButton = (icon: IconName, title: string, enabled: boolean, onClick: () => void): HTMLButtonElement => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'item-card__icon-button';
  button.title = title;
  button.disabled = !enabled;
  button.appendChild(createIcon(icon));
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    onClick();
  });
  return button;
};

export const createItemCard = (item: CatalogItem, callbacks: ItemCardCallbacks): HTMLElement => {
  const card = document.createElement('div');
  card.className = 'item-card';

  const image = document.createElement('img');
  image.className = 'item-card__poster';
  image.src = catalogPosterUrl(item);
  image.alt = item.name;
  card.appendChild(image);

  const overlay = document.createElement('div');
  overlay.className = 'item-card__overlay';
  overlay.append(
    createIconButton('chevronUp', 'Move to the tier above', callbacks.canMoveUp, callbacks.onMoveUp),
    createIconButton('trash', 'Remove', true, callbacks.onRemove),
    createIconButton('chevronDown', 'Move to the tier below', callbacks.canMoveDown, callbacks.onMoveDown),
  );
  card.appendChild(overlay);

  return card;
};
