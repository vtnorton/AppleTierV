import type { CatalogItem, MediaType } from '../tierlist/catalogItem';
import { buildCatalogIndex } from '../tierlist/catalogIndex';
import { addCustomItem, loadCustomItems } from '../tierlist/customItemsStorage';
import { addItemToTier, moveItemToAdjacentTier, removeItem, renameTier } from '../tierlist/tierlistActions';
import { loadTierlistState, saveTierlistState } from '../tierlist/tierlistStorage';
import type { TierlistState } from '../tierlist/tier';
import { downloadTierlistImage } from '../render/downloadImage';
import { createProgressBar } from '../ui/progressBar';
import { applyResponsiveRowHeight } from '../ui/rowHeight';
import { createSearchPanel } from '../ui/searchPanel';
import { createShareControls } from '../ui/shareControls';
import { createSidebar } from '../ui/sidebar';
import { createTierRow } from '../ui/tierRow';

const RESIZE_DEBOUNCE_MS = 150;

const debounce = (fn: () => void, delayMs: number): (() => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(fn, delayMs);
  };
};

export const bootstrapTierlistApp = (type: MediaType, builtInCatalog: CatalogItem[]): void => {
  const tierlistPanel = document.getElementById('tierlist-panel');
  const sidebarSlot = document.getElementById('sidebar');
  if (!tierlistPanel || !sidebarSlot) {
    throw new Error('Missing #tierlist-panel or #sidebar root element');
  }

  let state = loadTierlistState();

  const currentCatalog = (): CatalogItem[] => {
    return [...builtInCatalog, ...loadCustomItems().filter((item) => item.type === type)];
  };

  const persistAndRerender = (nextState: TierlistState): void => {
    state = nextState;
    saveTierlistState(state);
    render();
  };

  const render = (): void => {
    tierlistPanel.innerHTML = '';
    sidebarSlot.innerHTML = '';

    const catalog = currentCatalog();
    const catalogIndex = buildCatalogIndex(catalog);
    const tiers = state[type];

    const searchPanel = createSearchPanel(type, tiers, catalogIndex, {
      onAdd: (item, tierId) => {
        if (item.posterUrl) {
          addCustomItem(item);
        }
        persistAndRerender(addItemToTier(state, type, tierId, item.id));
      },
    });

    const shareControls = createShareControls({
      getState: () => state,
      onImport: (imported) => persistAndRerender(imported),
      onDownload: () => downloadTierlistImage(type, tiers, catalogIndex, catalog.length),
    });

    sidebarSlot.appendChild(createSidebar(type, searchPanel, shareControls));

    const rows = document.createElement('div');
    rows.className = 'tierlist-rows';
    tiers.forEach((tier, index) => {
      rows.appendChild(
        createTierRow(
          tier,
          catalogIndex,
          { isFirstTier: index === 0, isLastTier: index === tiers.length - 1 },
          {
            onRename: (name) => persistAndRerender(renameTier(state, type, tier.id, name)),
            onRemoveItem: (itemId) => persistAndRerender(removeItem(state, type, itemId)),
            onMoveItem: (itemId, direction) => {
              persistAndRerender(moveItemToAdjacentTier(state, type, tier.id, itemId, direction));
            },
          },
        ),
      );
    });
    tierlistPanel.appendChild(rows);

    tierlistPanel.appendChild(createProgressBar(tiers, catalog.length));

    applyResponsiveRowHeight(tierlistPanel, rows, tiers.length);
  };

  render();
  window.addEventListener('resize', debounce(render, RESIZE_DEBOUNCE_MS));
};
