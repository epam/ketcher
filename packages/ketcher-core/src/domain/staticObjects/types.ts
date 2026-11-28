import type { SimpleObjectMode } from 'domain/entities/simpleObject';
import type { Vec2 } from 'domain/entities/vec2';

export type ShapeKind = SimpleObjectMode;

export interface ShapeGeometry {
  readonly kind: ShapeKind;
  readonly start: Vec2;
  readonly end: Vec2;
}

export interface Box {
  readonly min: Vec2;
  readonly max: Vec2;
}

export type BoxHandle =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'topLeft'
  | 'bottomLeft'
  | 'bottomRight'
  | 'topRight';

export type LineHandle = 'start' | 'end';

export type Handle = BoxHandle | LineHandle;

export interface HitResult {
  readonly distance: number;
  readonly handle: Handle | null;
  readonly handlePosition: Vec2 | null;
}

export interface HitTolerance {
  readonly outline: number;
  readonly handle: number;
}
