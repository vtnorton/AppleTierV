import type { CatalogIndex } from '../tierlist/catalogIndex';
import type { MediaType } from '../tierlist/catalogItem';
import type { Tier } from '../tierlist/tier';
import { renderTierlistCanvas } from './tierlistCanvas';

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to encode canvas as PNG'));
        return;
      }
      resolve(blob);
    }, 'image/png');
  });
};

export const downloadTierlistImage = async (
  type: MediaType,
  tiers: Tier[],
  catalogIndex: CatalogIndex,
  catalogTotal: number,
): Promise<void> => {
  const canvas = document.createElement('canvas');
  await renderTierlistCanvas(canvas, tiers, catalogIndex, catalogTotal);
  const blob = await canvasToBlob(canvas);

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `apple-tv-${type}-tierlist.png`;
  link.click();
  URL.revokeObjectURL(url);
};
