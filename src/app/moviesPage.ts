import catalog from '../../data/catalog-movies.json';
import type { CatalogItem } from '../tierlist/catalogItem';
import { installAgentApi } from './agentApi';
import { bootstrapTierlistApp } from './tierlistApp';

const moviesCatalog = catalog as CatalogItem[];

installAgentApi('movies', moviesCatalog);
bootstrapTierlistApp('movies', moviesCatalog);
