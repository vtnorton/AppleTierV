import type { CatalogItem, MediaType } from '../tierlist/catalogItem';
import { buildCatalogIndex } from '../tierlist/catalogIndex';
import { loadCustomItems } from '../tierlist/customItemsStorage';
import { decodeShareCode, encodeShareCode } from '../tierlist/shareCode';
import { addItemToTier, moveItemToAdjacentTier, moveItemToTier, removeItem } from '../tierlist/tierlistActions';
import { loadTierlistState, saveTierlistState } from '../tierlist/tierlistStorage';
import { downloadTierlistImage } from '../render/downloadImage';

type MoveDirection = 'up' | 'down';

export type TierlistAgentApi = {
  addItem: (tierId: string, catalogId: number) => void;
  removeItem: (itemId: number) => void;
  moveItemToAdjacentTier: (tierId: string, itemId: number, direction: MoveDirection) => void;
  moveItemToTier: (itemId: number, targetTierId: string) => void;
  exportState: () => string;
  importState: (code: string) => void;
  downloadImage: () => Promise<void>;
};

declare global {
  interface Window {
    Tierlist: TierlistAgentApi;
  }
}

export const installAgentApi = (type: MediaType, builtInCatalog: CatalogItem[]): void => {
  const currentCatalog = (): CatalogItem[] => {
    return [...builtInCatalog, ...loadCustomItems().filter((item) => item.type === type)];
  };

  window.Tierlist = {
    addItem: (tierId, catalogId) => {
      saveTierlistState(addItemToTier(loadTierlistState(), type, tierId, catalogId));
    },
    removeItem: (itemId) => {
      saveTierlistState(removeItem(loadTierlistState(), type, itemId));
    },
    moveItemToAdjacentTier: (tierId, itemId, direction) => {
      saveTierlistState(moveItemToAdjacentTier(loadTierlistState(), type, tierId, itemId, direction));
    },
    moveItemToTier: (itemId, targetTierId) => {
      saveTierlistState(moveItemToTier(loadTierlistState(), type, itemId, targetTierId));
    },
    exportState: () => {
      return encodeShareCode(loadTierlistState());
    },
    importState: (code) => {
      saveTierlistState(decodeShareCode(code));
    },
    downloadImage: async () => {
      const state = loadTierlistState();
      const catalog = currentCatalog();
      await downloadTierlistImage(type, state[type], buildCatalogIndex(catalog), catalog.length);
    },
  };
};
