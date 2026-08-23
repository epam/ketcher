import type { Vec2 } from 'ketcher-core';

export interface ClosestItem<T = Vec2> {
  id: number;
  dist: number;
  ref?: T | null;
}

export interface ClosestItemWithMap<T = unknown, Map extends string = string>
  extends ClosestItem<T> {
  map: Map;
}

export interface SkipItem {
  map: string;
  id: number;
}

export interface SelectedItems {
  atoms: number[];
  bonds: number[];
  [key: string]: number[];
}

export interface MergeResult {
  atoms: Map<number, number>;
  atomToFunctionalGroup: Map<number, number>;
}
