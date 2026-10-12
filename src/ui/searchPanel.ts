import { catalogPosterUrl } from '../tierlist/catalogItem';
import type { CatalogItem, MediaType } from '../tierlist/catalogItem';
import { searchCatalog } from '../tierlist/catalogIndex';
import type { CatalogIndex } from '../tierlist/catalogIndex';
import { searchExternalCatalog } from '../tierlist/externalCatalogSearch';
import type { Tier } from '../tierlist/tier';

const SEARCH_RESULT_LIMIT = 8;

type SearchPanelCallbacks = {
  onAdd: (item: CatalogItem, tierId: string) => void;
};

const createResultRow = (item: CatalogItem, tiers: Tier[], onAdd: SearchPanelCallbacks['onAdd']): HTMLElement => {
  const row = document.createElement('div');
  row.className = 'search-panel__row';

  const thumbnail = document.createElement('img');
  thumbnail.className = 'search-panel__thumbnail';
  thumbnail.src = catalogPosterUrl(item);
  thumbnail.alt = item.name;
  row.appendChild(thumbnail);

  const name = document.createElement('span');
  name.className = 'search-panel__row-name';
  name.textContent = item.name;
  row.appendChild(name);

  const tierSelect = document.createElement('select');
  tierSelect.className = 'search-panel__tier-select';

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Add to tier…';
  placeholder.disabled = true;
  placeholder.selected = true;
  tierSelect.appendChild(placeholder);

  for (const tier of tiers) {
    const option = document.createElement('option');
    option.value = tier.id;
    option.textContent = tier.name;
    tierSelect.appendChild(option);
  }

  tierSelect.addEventListener('change', () => {
    if (tierSelect.value) {
      onAdd(item, tierSelect.value);
    }
  });
  row.appendChild(tierSelect);

  return row;
};

export const createSearchPanel = (
  type: MediaType,
  tiers: Tier[],
  catalogIndex: CatalogIndex,
  callbacks: SearchPanelCallbacks,
): HTMLElement => {
  const panel = document.createElement('section');
  panel.className = 'search-panel';

  const title = document.createElement('h2');
  title.textContent = 'Add a title';
  panel.appendChild(title);

  const input = document.createElement('input');
  input.type = 'search';
  input.className = 'search-panel__input';
  input.placeholder = `Search ${type}…`;
  panel.appendChild(input);

  const results = document.createElement('div');
  results.className = 'search-panel__results';
  panel.appendChild(results);

  const renderResults = (items: CatalogItem[], emptyMessage: string | null): void => {
    results.innerHTML = '';
    if (items.length === 0 && emptyMessage) {
      const empty = document.createElement('p');
      empty.className = 'search-panel__empty';
      empty.textContent = emptyMessage;
      results.appendChild(empty);
      return;
    }
    for (const item of items) {
      results.appendChild(createResultRow(item, tiers, callbacks.onAdd));
    }
  };

  input.addEventListener('input', async () => {
    const query = input.value.trim();
    if (!query) {
      renderResults([], null);
      return;
    }

    const localMatches = searchCatalog(catalogIndex, query, SEARCH_RESULT_LIMIT);
    if (localMatches.length > 0) {
      renderResults(localMatches, null);
      return;
    }

    renderResults([], 'Searching outside the catalog…');
    const externalMatches = await searchExternalCatalog(type, query);
    renderResults(externalMatches, 'No matches found.');
  });

  return panel;
};
