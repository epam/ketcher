/****************************************************************************
 * Copyright 2021 EPAM Systems
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

import type { Vec2 } from 'domain/entities/vec2';
import { SGroupBracketType } from 'domain/entities/sgroup';

export interface SGroupBracketShapeParams {
  // Canvas-space vector along the bracket spine.
  bracketDirection: Vec2;
  // Canvas-space vector pointing away from the group.
  bracketAngleDirection: Vec2;
  center: Vec2;
  width: number;
  height: number;
}

export interface SGroupBracketEndpoints {
  // Ends of the bracket spine, the outermost edge of the bracket envelope.
  point0: Vec2;
  point1: Vec2;
  // Ends of the bracket that point back towards the group.
  arc0: Vec2;
  arc1: Vec2;
}

export function getSGroupBracketEndpoints({
  bracketDirection,
  bracketAngleDirection,
  center,
  width,
  height,
}: SGroupBracketShapeParams): SGroupBracketEndpoints {
  const point0 = center.addScaled(bracketDirection, -0.5 * height);
  const point1 = center.addScaled(bracketDirection, 0.5 * height);

  return {
    point0,
    point1,
    arc0: point0.addScaled(bracketAngleDirection, -width),
    arc1: point1.addScaled(bracketAngleDirection, -width),
  };
}

type FormatCoordinate = (value: number) => string | number;

const defaultFormat: FormatCoordinate = (value) => value;

/**
 * Builds the SVG path of one S-group bracket. All bracket types share the
 * same envelope (spine and inner ends), so only the drawn shape differs.
 */
export function getSGroupBracketPath(
  bracketType: SGroupBracketType | undefined,
  params: SGroupBracketShapeParams,
  format: FormatCoordinate = defaultFormat,
): string {
  const { point0, point1, arc0, arc1 } = getSGroupBracketEndpoints(params);
  const p = (point: Vec2) => `${format(point.x)},${format(point.y)}`;

  // Local coordinates: u runs along the spine from -height/2 to height/2,
  // v runs from the inner ends (-width) to the spine (0).
  const { bracketDirection, bracketAngleDirection, center, width, height } =
    params;
  const local = (u: number, v: number) =>
    center.addScaled(bracketDirection, u).addScaled(bracketAngleDirection, v);
  const halfHeight = 0.5 * height;

  switch (bracketType) {
    case SGroupBracketType.Round: {
      // Split the original cubic at its spine midpoint so its control points
      // stay inside the bracket envelope without changing the curve.
      const controlU = (halfHeight * 1.45) / 2;
      return [
        `M${p(arc0)}`,
        `C${p(local(-controlU, -width / 3))} ${p(
          local(-controlU / 2, 0),
        )} ${p(center)}`,
        `C${p(local(controlU / 2, 0))} ${p(
          local(controlU, -width / 3),
        )} ${p(arc1)}`,
      ].join('');
    }
    case SGroupBracketType.Curly: {
      const bodyV = -0.5 * width;
      const radius = Math.min(0.5 * width, 0.25 * height);
      return [
        `M${p(arc0)}`,
        `Q${p(local(-halfHeight, bodyV))} ${p(
          local(-halfHeight + radius, bodyV),
        )}`,
        `L${p(local(-radius, bodyV))}`,
        `Q${p(local(0, bodyV))} ${p(local(0, 0))}`,
        `Q${p(local(0, bodyV))} ${p(local(radius, bodyV))}`,
        `L${p(local(halfHeight - radius, bodyV))}`,
        `Q${p(local(halfHeight, bodyV))} ${p(arc1)}`,
      ].join('');
    }
    case SGroupBracketType.Square:
    default:
      return `M${p(arc0)}L${p(point0)}L${p(point1)}L${p(arc1)}`;
  }
}
