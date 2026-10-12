import { decodeShareCode, encodeShareCode } from '../tierlist/shareCode';
import type { TierlistState } from '../tierlist/tier';
import { createIcon } from './icons';
import type { IconName } from './icons';

const COPIED_LABEL_DURATION_MS = 1500;

type ShareControlsCallbacks = {
  getState: () => TierlistState;
  onImport: (state: TierlistState) => void;
  onDownload: () => void;
};

const createButton = (icon: IconName, label: string, onClick: () => void): HTMLButtonElement => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'share-controls__button';
  button.appendChild(createIcon(icon));
  const text = document.createElement('span');
  text.textContent = label;
  button.appendChild(text);
  button.addEventListener('click', onClick);
  return button;
};

export const createShareControls = (callbacks: ShareControlsCallbacks): HTMLElement => {
  const section = document.createElement('section');
  section.className = 'share-controls';

  const title = document.createElement('h2');
  title.textContent = 'Save & share';
  section.appendChild(title);

  const note = document.createElement('p');
  note.className = 'share-controls__note';
  note.textContent = 'Covers your whole tier list, series and movies together.';
  section.appendChild(note);

  const buttons = document.createElement('div');
  buttons.className = 'share-controls__buttons';
  buttons.appendChild(createButton('download', 'Download PNG', callbacks.onDownload));

  const shareButton = createButton('link', 'Copy share code', async () => {
    await navigator.clipboard.writeText(encodeShareCode(callbacks.getState()));
    const label = shareButton.querySelector('span')!;
    const originalLabel = label.textContent;
    label.textContent = 'Copied!';
    window.setTimeout(() => {
      label.textContent = originalLabel;
    }, COPIED_LABEL_DURATION_MS);
  });
  buttons.appendChild(shareButton);

  buttons.appendChild(
    createButton('upload', 'Import share code', () => {
      const code = window.prompt('Paste a share code:');
      if (!code) {
        return;
      }
      callbacks.onImport(decodeShareCode(code.trim()));
    }),
  );
  section.appendChild(buttons);

  return section;
};
