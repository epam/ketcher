import type { Action } from 'ketcher-core';
import type { ClosestItemWithMap } from '../shared/closest.types';

export interface AtomToolDragContext {
  item: ClosestItemWithMap | null;
  isSaltOrSolvent: boolean;
  action?: Action;
}
