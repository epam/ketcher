/****************************************************************************
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

export type ImplicitHydrogenSide = 'right' | 'left' | 'top' | 'bottom';

const FULL_TURN_DEG = 360;
const QUADRANT_DEG = 90;
// A vertical bond is drawn this close to 90 or 270 degrees; the sign of its
// cosine is rounding noise, so it must not pick a side.
const VERTICAL_TOLERANCE_DEG = 0.5;
const ANGLE_PRECISION = 100; // angles are rounded to 0.01 degree

// Each quadrant spans [startDeg, startDeg + 90). The order is the priority
// in which a free quadrant is taken.
const QUADRANTS: ReadonlyArray<readonly [ImplicitHydrogenSide, number]> = [
  ['right', 315],
  ['left', 135],
  ['top', 45],
  ['bottom', 225],
];

function normalizeAngle(angleDeg: number): number {
  const rounded = Math.round(angleDeg * ANGLE_PRECISION) / ANGLE_PRECISION;
  return ((rounded % FULL_TURN_DEG) + FULL_TURN_DEG) % FULL_TURN_DEG;
}

function isInQuadrant(angleDeg: number, startDeg: number): boolean {
  const offset = (angleDeg - startDeg + FULL_TURN_DEG) % FULL_TURN_DEG;
  return offset < QUADRANT_DEG;
}

function isVertical(angleDeg: number): boolean {
  return (
    Math.abs(angleDeg - 90) <= VERTICAL_TOLERANCE_DEG ||
    Math.abs(angleDeg - 270) <= VERTICAL_TOLERANCE_DEG
  );
}

/**
 * Converts a model direction (y points down) into a visual angle in
 * [0, 360), where 0 is right and 90 is up. The y flip lives here only.
 */
function bondAngleDeg(dir: { x: number; y: number }): number {
  const angleDeg = (Math.atan2(-dir.y, dir.x) * 180) / Math.PI;
  return (angleDeg + FULL_TURN_DEG) % FULL_TURN_DEG;
}

/**
 * Picks the side of the atom symbol where implicit hydrogens are drawn.
 * Each bond is a direction from the atom in model coordinates, where y points
 * down, so an up bond is { x: 0, y: -1 }.
 *
 * A terminal atom (at most one bond) puts them opposite its bond, and on the
 * right for no bond or a vertical bond. An internal atom puts them in the
 * first quadrant, in the order right, left, top, bottom, that has no bond and
 * no radical (a radical occupies top), and on the right when none is free.
 */
export function getImplicitHydrogenSide(
  bondDirections: ReadonlyArray<{ x: number; y: number }>,
  hasRadical: boolean,
): ImplicitHydrogenSide {
  const angles = bondDirections.map(bondAngleDeg).map(normalizeAngle);

  if (angles.length <= 1) {
    const [angle] = angles;
    if (angle === undefined || isVertical(angle)) {
      return 'right';
    }
    return Math.cos((angle * Math.PI) / 180) > 0 ? 'left' : 'right';
  }

  const free = QUADRANTS.find(
    ([side, startDeg]) =>
      !(hasRadical && side === 'top') &&
      !angles.some((angle) => isInQuadrant(angle, startDeg)),
  );
  return free ? free[0] : 'right';
}
