export interface SearchInput {
  values: number[];  // must be pre-sorted
  target: number;
}

export interface SearchBarState {
  values: number[];
  ids: string[];
  left: number;
  right: number;
  mid: number | null;
  target: number;
  found: boolean;
  eliminated: number[];  // indices that are out of consideration (greyed out)
}
