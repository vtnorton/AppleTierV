const NARROW_BREAKPOINT_PX = 720;
const PROGRESS_BAR_HEIGHT_PX = 56;
const MIN_ROW_HEIGHT_PX = 90;
const CARD_ASPECT_RATIO = 2 / 3;

export const applyResponsiveRowHeight = (panel: HTMLElement, rowsContainer: HTMLElement, tierCount: number): void => {
  if (window.innerWidth <= NARROW_BREAKPOINT_PX || tierCount === 0) {
    rowsContainer.style.removeProperty('--row-height');
    rowsContainer.style.removeProperty('--card-width');
    return;
  }

  const available = panel.clientHeight - PROGRESS_BAR_HEIGHT_PX;
  const rowHeight = Math.max(MIN_ROW_HEIGHT_PX, Math.floor(available / tierCount));
  rowsContainer.style.setProperty('--row-height', `${rowHeight}px`);
  rowsContainer.style.setProperty('--card-width', `${Math.floor(rowHeight * CARD_ASPECT_RATIO)}px`);
};
