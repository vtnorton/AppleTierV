import type { MediaType } from '../tierlist/catalogItem';

const PAGE_BY_TYPE: Record<MediaType, string> = {
  series: 'series.html',
  movies: 'movies.html',
};

const LABEL_BY_TYPE: Record<MediaType, string> = {
  series: 'Series',
  movies: 'Movies',
};

const HOW_TO_STEPS = [
  'Search a title and pick a tier for it.',
  'Hover a poster to move it to the tier above or below, or remove it.',
  'Click a tier name to rename it.',
  'Download a PNG or copy a share code to back up your list.',
];

const createTabs = (activeType: MediaType): HTMLElement => {
  const nav = document.createElement('nav');
  nav.className = 'sidebar__tabs';
  for (const type of ['series', 'movies'] as const) {
    const link = document.createElement('a');
    link.href = PAGE_BY_TYPE[type];
    link.textContent = LABEL_BY_TYPE[type];
    if (type === activeType) {
      link.setAttribute('aria-current', 'page');
    }
    nav.appendChild(link);
  }
  return nav;
};

const createMenuToggle = (menuContent: HTMLElement): HTMLButtonElement => {
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'sidebar__menu-toggle';
  toggle.textContent = 'Menu';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.addEventListener('click', () => {
    const isOpen = menuContent.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  return toggle;
};

const createIntro = (): HTMLElement => {
  const section = document.createElement('section');
  section.className = 'sidebar__intro';

  const title = document.createElement('h1');
  title.textContent = 'Apple TV+ Tier List';
  section.appendChild(title);

  const description = document.createElement('p');
  description.textContent =
    'Rank everything you have watched on Apple TV+. It runs entirely in your browser: nothing is uploaded anywhere.';
  section.appendChild(description);

  return section;
};

const createHowToUse = (): HTMLElement => {
  const section = document.createElement('section');
  section.className = 'sidebar__how-to';

  const title = document.createElement('h2');
  title.textContent = 'How to use';
  section.appendChild(title);

  const list = document.createElement('ol');
  for (const step of HOW_TO_STEPS) {
    const item = document.createElement('li');
    item.textContent = step;
    list.appendChild(item);
  }
  section.appendChild(list);

  return section;
};

export const createSidebar = (type: MediaType, searchPanel: HTMLElement, shareControls: HTMLElement): HTMLElement => {
  const sidebar = document.createElement('div');
  sidebar.className = 'sidebar';

  const menuContent = document.createElement('div');
  menuContent.className = 'sidebar__menu-content';
  menuContent.append(createIntro(), createHowToUse(), searchPanel, shareControls);

  const bar = document.createElement('div');
  bar.className = 'sidebar__bar';
  bar.append(createTabs(type), createMenuToggle(menuContent));

  sidebar.append(bar, menuContent);
  return sidebar;
};
