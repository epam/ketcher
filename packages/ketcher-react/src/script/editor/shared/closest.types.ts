import { Vec2 } from 'domain/entities';

export interface ClosestItem<T = Vec2> {
  id: number;
  dist: number;
  ref?: T | null;
}

export interface ClosestItemWithMap<T = unknown> extends ClosestItem<T> {
  map: string;
}
