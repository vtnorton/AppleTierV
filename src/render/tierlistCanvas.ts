import { catalogPosterUrl } from '../tierlist/catalogItem';
import type { CatalogIndex } from '../tierlist/catalogIndex';
import { findCatalogItem } from '../tierlist/catalogIndex';
import { countWatched } from '../tierlist/progress';
import type { Tier } from '../tierlist/tier';
import { BAR_H, CARD_W, COLORS, LABEL_W, MIN_COLS, ROW_H } from './layoutConstants';

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
};

const wrapLabelLines = (context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const words = text.toUpperCase().split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines;
};

const drawTierLabel = (context: CanvasRenderingContext2D, tier: Tier, y: number): void => {
  context.font = 'bold 42px Arial, Helvetica, sans-serif';
  context.fillStyle = COLORS.labelText;
  context.textBaseline = 'alphabetic';

  const lines = wrapLabelLines(context, tier.name, LABEL_W - 36);
  const lineHeight = 48;
  const startY = y + (ROW_H - lineHeight * lines.length) / 2 + lineHeight * 0.75;

  lines.forEach((line, index) => {
    const width = context.measureText(line).width;
    context.fillText(line, (LABEL_W - width) / 2, startY + index * lineHeight);
  });
};

const drawPosterCover = (context: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number): void => {
  const scale = Math.max(CARD_W / image.width, ROW_H / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  context.drawImage(
    image,
    x + (CARD_W - drawWidth) / 2,
    y + (ROW_H - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
};

const drawProgressBar = (context: CanvasRenderingContext2D, watched: number, total: number, y: number, width: number): void => {
  const ratio = total > 0 ? watched / total : 0;
  const label = `${watched} / ${total}  (${(ratio * 100).toFixed(2)}%)`;

  context.fillStyle = COLORS.barBackground;
  context.fillRect(0, y, width, BAR_H);

  context.fillStyle = COLORS.barFill;
  context.fillRect(0, y, width * ratio, BAR_H);

  context.font = 'bold 32px Arial, Helvetica, sans-serif';
  context.fillStyle = COLORS.barText;
  const textWidth = context.measureText(label).width;
  context.fillText(label, (width - textWidth) / 2, y + BAR_H / 2 + 11);
};

export const renderTierlistCanvas = async (
  canvas: HTMLCanvasElement,
  tiers: Tier[],
  catalogIndex: CatalogIndex,
  catalogTotal: number,
): Promise<void> => {
  const maxItemsInARow = tiers.reduce((max, tier) => Math.max(max, tier.itemIds.length), 0);
  const cols = Math.max(MIN_COLS, maxItemsInARow);
  const width = LABEL_W + CARD_W * cols;
  const height = ROW_H * tiers.length + BAR_H;

  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D context is unavailable');
  }

  context.fillStyle = COLORS.background;
  context.fillRect(0, 0, width, height);

  for (const [rowIndex, tier] of tiers.entries()) {
    const y = rowIndex * ROW_H;

    context.fillStyle = tier.color;
    context.fillRect(0, y, LABEL_W, ROW_H);
    context.fillStyle = COLORS.cardsBackground;
    context.fillRect(LABEL_W, y, width - LABEL_W, ROW_H);
    drawTierLabel(context, tier, y);

    for (const [columnIndex, itemId] of tier.itemIds.entries()) {
      const x = LABEL_W + columnIndex * CARD_W;
      context.fillStyle = COLORS.cardBackground;
      context.fillRect(x, y, CARD_W, ROW_H);

      const item = findCatalogItem(catalogIndex, itemId);
      if (!item) {
        continue;
      }
      const image = await loadImage(catalogPosterUrl(item));
      drawPosterCover(context, image, x, y);
    }
  }

  drawProgressBar(context, countWatched(tiers), catalogTotal, ROW_H * tiers.length, width);
};
