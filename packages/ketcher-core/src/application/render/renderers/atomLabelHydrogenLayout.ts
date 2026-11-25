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
// getImplicitHydrogenSide; this file only draws it. The renderer keeps what
// appendStackedHydrogenLabel returns, so later steps find the lines of the
// label without reading the DOM back.

type TextSelection = D3SvgElementSelection<SVGTextElement, void>;
type TspanSelection = D3SvgElementSelection<SVGTSpanElement, void>;

export const LABEL_FONT_SIZE = 13;
// Matches the label font, so the H line does not touch the symbol line.
export const LINE_HEIGHT = LABEL_FONT_SIZE;
// The hydrogen count is a subscript, as in the side-by-side layout.
export const COUNT_DROP = 3;
// Distance from the centre of H to the centre of its count.
const COUNT_OFFSET_X = 10;
// Half the advance of one digit of the 13px label font. The count is centred
// on COUNT_OFFSET_X, so its right edge is this far past it for each digit.
const COUNT_HALF_DIGIT = 3.6;
// Gap kept between the count and the text that follows it.
const COUNT_GAP = 1;
const ISOTOPE_RISE = 4;

/** The lines of a stacked label, as drawn by appendStackedHydrogenLabel. */
export interface StackedLabel {
  hydrogen: TspanSelection;
  symbol: TspanSelection;
  /**
   * The count of H. Undefined when H has no count: nothing collides and a text
   * that follows the symbol continues it as usual.
   */
  count?: {
    tspan: TspanSelection;
    /** Where a text that follows the symbol must start to clear the count. */
    startAfter: number;
  };
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
): StackedLabel {
  const hydrogenDy = side === 'top' ? -LINE_HEIGHT : LINE_HEIGHT;
  const hasCount = hydrogenAmount > 1;

  const hydrogen = text
    .append('tspan')
    .attr('x', 0)
    .attr('dy', hydrogenDy)
    .text('H');
  const countTspan = hasCount
    ? text
        .append('tspan')
        .attr('x', COUNT_OFFSET_X)
        .attr('dy', COUNT_DROP)
        .text(hydrogenAmount)
    : undefined;
  const symbol = text
    .append('tspan')
    .attr('x', 0)
    .attr('dy', -hydrogenDy - (hasCount ? COUNT_DROP : 0))
    .text(labelText);

  return {
    hydrogen,
    symbol,
    count: countTspan && {
      tspan: countTspan,
      startAfter:
        COUNT_OFFSET_X +
        String(hydrogenAmount).length * COUNT_HALF_DIGIT +
        COUNT_GAP,
    },
  };
}

/**
 * The isotope is a superscript of the symbol: it takes over the symbol line's
 * start (`x` and the move from the H line) and the symbol follows it.
 */
export function startSymbolLineWithIsotope(
  { symbol }: StackedLabel,
  isotope: TspanSelection,
): void {
  isotope
    .attr('x', symbol.attr('x'))
    .attr('dy', Number(symbol.attr('dy')) - ISOTOPE_RISE);
  symbol.attr('x', null).attr('dy', ISOTOPE_RISE);
}

/**
 * Charge and valence follow the symbol and share its centred run of text, so
 * they land under the count of H. The first of them starts its own run,
 * left-aligned right of the count; the ones after it follow it. The caller
 * passes only that first one. Without a count nothing collides and the run
 * stays as it is.
 */
export function startPropertyRunAfterCount(
  { count }: StackedLabel,
  firstProperty: TspanSelection,
): void {
  if (!count) {
    return;
  }
  firstProperty.attr('x', count.startAfter).attr('text-anchor', 'start');
}

export interface LabelBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * The rectangle that wraps the label for hover, selection and the bad-valence
 * line, grown by `padding`. A side-by-side label is centred on the atom, so
 * its rectangle is centred too; a stacked label has an extra line, so its
 * rectangle follows the measured text box. Size falls back to 8 while the text
 * is not measured.
 */
export function labelContourRect(
  isStacked: boolean,
  labelBox: LabelBox | undefined,
  padding: number,
): LabelBox {
  const width = labelBox?.width ?? 8;
  const height = labelBox?.height ?? 8;
  const top = isStacked ? (labelBox?.y ?? 0) : -(height / 2);

  return {
    x: (labelBox?.x ?? 0) - padding,
    y: top - padding,
    width: width + padding * 2,
    height: height + padding * 2,
  };
}
