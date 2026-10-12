export type Tier = {
  id: string;
  name: string;
  color: string;
  itemIds: number[];
};

export type TierlistState = {
  series: Tier[];
  movies: Tier[];
};
