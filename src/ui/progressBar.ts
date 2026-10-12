import { countWatched } from '../tierlist/progress';
import type { Tier } from '../tierlist/tier';

export const createProgressBar = (tiers: Tier[], total: number): HTMLElement => {
  const watched = countWatched(tiers);
  const ratio = total > 0 ? watched / total : 0;

  const bar = document.createElement('div');
  bar.className = 'progress-bar';

  const fill = document.createElement('div');
  fill.className = 'progress-bar__fill';
  fill.style.width = `${ratio * 100}%`;
  bar.appendChild(fill);

  const label = document.createElement('span');
  label.className = 'progress-bar__label';
  label.textContent = `${watched} / ${total}  (${(ratio * 100).toFixed(2)}%)`;
  bar.appendChild(label);

  return bar;
};
