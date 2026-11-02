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

import type { D3SvgElementSelection } from 'application/render/types';
import type { ImplicitHydrogenSide } from 'domain/helpers';

// SVG text mechanics of macromolecules mode for implicit hydrogens drawn on
// top of or below the atom symbol. Which side to use is decided by
// getImplicitHydrogenSide; this file only draws it.

type TextSelection = D3SvgElementSelection<SVGTextElement, void>;
type TspanSelection = D3SvgElementSelection<SVGTSpanElement, void>;

// Matches the 13px label font, so the H line does not touch the symbol line.
const LINE_HEIGHT = 13;
// The hydrogen count is a subscript, as in the side-by-side layout.
const COUNT_DROP = 3;
// Distance from the centre of H to the centre of its count.
const COUNT_OFFSET_X = 10;
// Half the advance of one digit of the 13px label font. The count is centred
// on COUNT_OFFSET_X, so its right edge is this far past it for each digit.
const COUNT_HALF_DIGIT = 3.6;
// Gap kept between the count and the text that follows it.
const COUNT_GAP = 1;
const ISOTOPE_RISE = 4;

export const STACKED_LABEL_CLASS = 'atom-label';
const STACKED_COUNT_CLASS = 'atom-hydrogen-count';

export function isStackedSide(side: ImplicitHydrogenSide): boolean {
  return side === 'top' || side === 'bottom';
}

/**
 * Draws `H` (and its count) on a line above or below the symbol, then the
 * symbol on its own line. Every line starts with an absolute `x`, so each is
 * centred on the atom by the text's `text-anchor: middle`.
 */
export function appendStackedHydrogenLabel(
  text: TextSelection,
  {
    side,
    hydrogenAmount,
    labelText,
  }: {
    side: ImplicitHydrogenSide;
    hydrogenAmount: number;
    labelText: string;
  },
): void {
  const hydrogenDy = side === 'top' ? -LINE_HEIGHT : LINE_HEIGHT;
  const hasCount = hydrogenAmount > 1;

  text.append('tspan').attr('x', 0).attr('dy', hydrogenDy).text('H');
  if (hasCount) {
    text
      .append('tspan')
      .attr('class', STACKED_COUNT_CLASS)
      .attr('x', COUNT_OFFSET_X)
      .attr('dy', COUNT_DROP)
      .text(hydrogenAmount);
  }
  text
    .append('tspan')
    .attr('class', STACKED_LABEL_CLASS)
    .attr('x', 0)
    .attr('dy', -hydrogenDy - (hasCount ? COUNT_DROP : 0))
    .text(labelText);
}

/**
 * The isotope is a superscript of the symbol: it takes over the symbol line's
 * start (`x` and the move from the H line) and the symbol follows it.
 */
export function startSymbolLineWithIsotope(
  text: TextSelection,
  isotope: TspanSelection,
): void {
  const label = text.select<SVGTSpanElement>(`tspan.${STACKED_LABEL_CLASS}`);
  isotope
    .attr('x', label.attr('x'))
    .attr('dy', Number(label.attr('dy')) - ISOTOPE_RISE);
  label.attr('x', null).attr('dy', ISOTOPE_RISE);
}

/**
 * Charge and valence follow the symbol and share its centred run of text, so
 * they land under the count of H. When the label has a count, the first of
 * them starts its own run, left-aligned right of the count, and the ones after
 * it follow it. Without a count nothing collides and the run stays as it is.
 */
export function startPropertyRunBesideCount(
  text: TextSelection,
  property: TspanSelection,
): void {
  const count = text.select<SVGTSpanElement>(`tspan.${STACKED_COUNT_CLASS}`);
  const startsAfterSymbol = property
    .node()
    ?.previousElementSibling?.classList.contains(STACKED_LABEL_CLASS);
  if (count.empty() || !startsAfterSymbol) {
    return;
  }
  const countRight =
    Number(count.attr('x')) + count.text().length * COUNT_HALF_DIGIT;
  property.attr('x', countRight + COUNT_GAP).attr('text-anchor', 'start');
}

/**
 * Top edge of the hover and selection contour, relative to the atom. The
 * contour of a side-by-side label is centred on the atom; a stacked label has
 * an extra line, so its contour follows the measured text box. `height` falls
 * back to 8 like the contour rectangles do while the text is not measured.
 */
export function labelContourTop(
  side: ImplicitHydrogenSide,
  labelBox?: { y: number; height: number },
): number {
  return isStackedSide(side)
    ? (labelBox?.y ?? 0)
    : -((labelBox?.height || 8) / 2);
}
