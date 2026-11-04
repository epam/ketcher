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

import type { ImplicitHydrogenSide } from 'domain/helpers';

export interface HydrogenOffset {
  x: number;
  y: number;
}

export interface HydrogenLayoutInput {
  hydrogenWidth: number;
  /** Width of the hydrogen count, or null when no count is drawn. */
  indexWidth: number | null;
  labelHeight: number;
  /** Half of the line width, the gap kept between label parts. */
  delta: number;
  zoom: number;
  /** Right edge of the label parts already drawn, relative to the atom. */
  rightMargin: number;
  /** Left edge of the label parts already drawn, relative to the atom. */
  leftMargin: number;
}

export interface HydrogenLayout {
  hydrogen: HydrogenOffset;
  index: HydrogenOffset | null;
  rightMargin: number;
  leftMargin: number;
}

// The count is a subscript: it hangs below the middle line of H.
const INDEX_DROP = 0.2;

function layoutRight(input: HydrogenLayoutInput): HydrogenLayout {
  const { hydrogenWidth, indexWidth, labelHeight, delta, zoom } = input;
  let { rightMargin } = input;
  const hydrogen = {
    x: rightMargin + 0.35 * hydrogenWidth + delta,
    y: 0,
  };
  rightMargin += hydrogenWidth + delta;
  let index: HydrogenOffset | null = null;
  if (indexWidth !== null) {
    index = {
      x: rightMargin + 0.15 * indexWidth * Math.min(zoom, 1) + delta,
      y: INDEX_DROP * labelHeight,
    };
    rightMargin += indexWidth + delta;
  }
  return { hydrogen, index, rightMargin, leftMargin: input.leftMargin };
}

function layoutLeft(input: HydrogenLayoutInput): HydrogenLayout {
  const { hydrogenWidth, indexWidth, labelHeight, delta, zoom } = input;
  let { leftMargin } = input;
  let index: HydrogenOffset | null = null;
  if (indexWidth !== null) {
    index = {
      x: leftMargin - 0.4 * indexWidth - delta,
      y: INDEX_DROP * labelHeight,
    };
    leftMargin -= indexWidth + delta;
  }
  const hydrogen = {
    x:
      leftMargin -
      0.4 * hydrogenWidth * (indexWidth !== null && zoom < 1 ? zoom : 1) -
      delta,
    y: 0,
  };
  leftMargin -= hydrogenWidth + delta;
  return { hydrogen, index, rightMargin: input.rightMargin, leftMargin };
}

/**
 * Top and bottom stack H over or under the symbol, centered on it, one label
 * height away. The count sits right of H. The hydrogens take no room beside
 * the symbol, so charge and valence keep their place next to it, except when a
 * count is drawn: the right margin moves out to the count's right edge, so they
 * are drawn clear of it, not on top of it.
 */
function layoutStacked(direction: -1 | 1) {
  return (input: HydrogenLayoutInput): HydrogenLayout => {
    const { hydrogenWidth, indexWidth, labelHeight, delta } = input;
    const hydrogen = { x: 0, y: direction * labelHeight };
    if (indexWidth === null) {
      return {
        hydrogen,
        index: null,
        rightMargin: input.rightMargin,
        leftMargin: input.leftMargin,
      };
    }
    const index = {
      x: 0.5 * hydrogenWidth + 0.5 * indexWidth + delta,
      y: hydrogen.y + INDEX_DROP * labelHeight,
    };
    return {
      hydrogen,
      index,
      rightMargin: Math.max(
        input.rightMargin,
        index.x + 0.5 * indexWidth + delta,
      ),
      leftMargin: input.leftMargin,
    };
  };
}

export const HYDROGEN_LAYOUT: Record<
  ImplicitHydrogenSide,
  (input: HydrogenLayoutInput) => HydrogenLayout
> = {
  right: layoutRight,
  left: layoutLeft,
  top: layoutStacked(-1),
  bottom: layoutStacked(1),
};
