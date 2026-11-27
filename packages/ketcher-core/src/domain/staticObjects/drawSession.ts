import { SimpleObjectMode } from 'domain/entities/simpleObject';
import { Vec2 } from 'domain/entities/vec2';
import { constrainToCircle } from './geometry';
import type { ShapeGeometry, ShapeKind } from './types';

export interface DrawModifiers {
  readonly shift: boolean;
}

export interface ShapeDrawSession {
  update(pointer: Vec2, modifiers: DrawModifiers): ShapeGeometry;
  finish(pointer: Vec2, modifiers: DrawModifiers): ShapeGeometry | null;
}

export function createShapeDrawSession(
  kind: ShapeKind,
  start: Vec2,
): ShapeDrawSession {
  const origin = new Vec2(start);
  let hasMoved = false;

  return {
    update(pointer, modifiers) {
      hasMoved = true;
      const shouldConstrain =
        modifiers.shift && kind === SimpleObjectMode.ellipse;

      return {
        kind,
        start: origin,
        end: shouldConstrain
          ? constrainToCircle(origin, pointer)
          : new Vec2(pointer),
      };
    },
    finish(pointer, modifiers) {
      if (!hasMoved) {
        return null;
      }

      return {
        kind,
        start: origin,
        end: modifiers.shift
          ? constrainToCircle(origin, pointer)
          : new Vec2(pointer),
      };
    },
  };
}
