import catalog from '../../data/catalog-series.json';
import type { CatalogItem } from '../tierlist/catalogItem';
import { installAgentApi } from './agentApi';
import { bootstrapTierlistApp } from './tierlistApp';

const seriesCatalog = catalog as CatalogItem[];

installAgentApi('series', seriesCatalog);
bootstrapTierlistApp('series', seriesCatalog);
