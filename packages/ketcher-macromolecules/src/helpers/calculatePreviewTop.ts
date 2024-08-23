/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
import { PolymerBond } from 'ketcher-core';
import { preview } from '../constants';
import { PreviewStyle } from 'state/common';
import assert from 'assert';

export const calculateMonomerPreviewTop = createCalculatePreviewTopFunction(
  preview.height,
);
export const calculateNucleoElementPreviewTop =
  createCalculatePreviewTopFunction(preview.heightForNucleotide);

function calculateTop(target: DOMRect, height: number): number {
  return target.top > height + preview.gap + preview.topPadding
    ? target.top - preview.gap - height
    : target.bottom + preview.gap;
}

function createCalculatePreviewTopFunction(
  height: number,
): (target?: DOMRect) => string {
  return function calculatePreviewTop(target?: DOMRect): string {
    if (!target) {
      return '';
    }

    const top = calculateTop(target, height);
    return `${top}px`;
  };
}

export const calculateBondPreviewPosition = (
  bond: PolymerBond,
  bondCoordinates: DOMRect,
): PreviewStyle => {
  const { firstMonomer, secondMonomer } = bond;

  assert(secondMonomer);

  const firstMonomerCoordinates = firstMonomer.renderer?.rootBoundingClientRect;
  const secondMonomerCoordinates =
    secondMonomer.renderer?.rootBoundingClientRect;

  assert(firstMonomerCoordinates);
  assert(secondMonomerCoordinates);

  const left = Math.min(
    bondCoordinates.left,
    firstMonomerCoordinates.left,
    secondMonomerCoordinates.left,
  );
  const top = Math.min(
    bondCoordinates.top,
    firstMonomerCoordinates.top,
    secondMonomerCoordinates.top,
  );
  const right = Math.max(
    bondCoordinates.right,
    firstMonomerCoordinates.right,
    secondMonomerCoordinates.right,
  );
  const bottom = Math.max(
    bondCoordinates.bottom,
    firstMonomerCoordinates.bottom,
    secondMonomerCoordinates.bottom,
  );

  const width = right - left;
  const height = bottom - top;

  let style: PreviewStyle = {};

  if (width > height) {
    let topValue: number;
    if (top > preview.height + preview.gap) {
      topValue = top - preview.heightForBond - preview.gap;
    } else {
      topValue = bottom + preview.gap;
    }

    style = {
      top: `${topValue}px`,
      left: `${left + width / 2}px`,
    };
  } else {
    let leftValue: number;
    if (left > preview.widthForBond + preview.gap) {
      leftValue = left - preview.widthForBond / 2 - preview.gap;
    } else {
      leftValue = right + preview.widthForBond / 2 + preview.gap;
    }

    style = {
      top: `${top + height / 2}px`,
      left: `${leftValue}px`,
    };
  }

  return style;
};
