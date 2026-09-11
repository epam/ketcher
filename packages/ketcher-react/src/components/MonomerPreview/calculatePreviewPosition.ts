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
import {
  type AmbiguousMonomerType,
  type PolymerBond,
  ZoomTool,
  assert,
} from 'ketcher-core';
import { preview } from './constants';
import type { PreviewStyle } from './AmbiguousMonomerPreview/types';
import { KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR } from 'src/constants';

export const calculateMonomerPreviewTop = createCalculatePreviewTopFunction(
  preview.height,
);
export const calculateNucleoElementPreviewTop =
  createCalculatePreviewTopFunction(preview.heightForNucleotide);

type CalculatePreviewTopPayload = { left: number; top: number; bottom: number };

function calculateTop(
  target: CalculatePreviewTopPayload,
  height: number,
): number {
  const ketcherEditorRoot = document.querySelector(
    KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
  );
  const ketcherEditorRootBoundingClientRect =
    ketcherEditorRoot?.getBoundingClientRect();
  const relativeTargetTop =
    target.top - (ketcherEditorRootBoundingClientRect?.top ?? 0);
  const relativeTargetBottom =
    target.bottom - (ketcherEditorRootBoundingClientRect?.top ?? 0);

  const topPreviewPosition =
    relativeTargetTop - preview.gap - height - preview.topPadding;
  const bottomPreviewPosition = relativeTargetBottom + preview.gap;

  if (relativeTargetTop > height + preview.gap + preview.topPadding) {
    return topPreviewPosition;
  }

  const editorRootHeight = ketcherEditorRootBoundingClientRect?.height ?? 0;
  const exceedsBottomBoundary = target.top + height > editorRootHeight;
  const isLowerHalf = target.top > editorRootHeight / 2;

  if (exceedsBottomBoundary && isLowerHalf) {
    return topPreviewPosition;
  }

  return bottomPreviewPosition;
}

function createCalculatePreviewTopFunction(
  height: number,
): (target?: CalculatePreviewTopPayload) => string {
  return function calculatePreviewTop(
    target?: CalculatePreviewTopPayload,
  ): string {
    if (!target) {
      return '';
    }

    const top = calculateTop(target, height);
    return `${top}px`;
  };
}

const calculateAmbiguousPreviewHeight = (monomersCount: number) => {
  const headingHeight = 16;
  const monomersHeight = 35 * monomersCount;
  return headingHeight + monomersHeight;
};

export const calculateAmbiguousMonomerPreviewTop = (
  monomer: AmbiguousMonomerType,
) => {
  const shouldHaveOneLine = monomer.label === 'X' || monomer.label === 'N';
  const monomersCount = shouldHaveOneLine ? 1 : monomer.monomers.length;
  const monomersCountToUse = Math.min(5, monomersCount);
  const height = calculateAmbiguousPreviewHeight(monomersCountToUse);

  return createCalculatePreviewTopFunction(height);
};

export function calculateAmbiguousMonomerPreviewLeft(initialLeft: number) {
  const canvasWrapperBoundingClientRect = ZoomTool.instance.canvasWrapper
    .node()
    ?.getBoundingClientRect();
  const PREVIEW_WIDTH = 70;
  const canvasWrapperRight = canvasWrapperBoundingClientRect?.right ?? 0;
  const canvasWrapperLeft = canvasWrapperBoundingClientRect?.left ?? 0;

  if (initialLeft + PREVIEW_WIDTH / 2 > canvasWrapperRight) {
    return canvasWrapperRight - PREVIEW_WIDTH;
  }

  if (initialLeft - PREVIEW_WIDTH / 2 < canvasWrapperLeft) {
    return canvasWrapperLeft;
  }

  return initialLeft - PREVIEW_WIDTH / 2;
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
  const canvasWrapperBoundingClientRect = ZoomTool.instance?.canvasWrapper
    .node()
    ?.getBoundingClientRect();
  const ketcherEditorRoot = document.querySelector(
    KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
  );
  const ketcherEditorRootBoundingClientRect =
    ketcherEditorRoot?.getBoundingClientRect();

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

  return calculateBondPreviewPositionByCoordinates(
    { left, top, right, bottom },
    canvasWrapperBoundingClientRect,
    ketcherEditorRootBoundingClientRect,
  );
};

type RectCoordinates = Pick<DOMRect, 'left' | 'top' | 'right' | 'bottom'>;

export function calculateBondPreviewPositionByCoordinates(
  bondWithMonomersCoordinates: RectCoordinates,
  canvasWrapperCoordinates?: RectCoordinates,
  ketcherRootCoordinates?: RectCoordinates,
): PreviewStyle {
  const { left, top, right, bottom } = bondWithMonomersCoordinates;
  const canvasWrapperTop = canvasWrapperCoordinates?.top ?? 0;
  const canvasWrapperBottom = canvasWrapperCoordinates?.bottom ?? 0;
  const canvasWrapperLeft = canvasWrapperCoordinates?.left ?? 0;
  const canvasWrapperRight = canvasWrapperCoordinates?.right ?? 0;
  const ketcherRootTop = ketcherRootCoordinates?.top ?? 0;
  const ketcherRootLeft = ketcherRootCoordinates?.left ?? 0;
  const horizontalBoundaryLeft =
    ketcherRootCoordinates?.left ?? canvasWrapperLeft;
  const horizontalBoundaryRight =
    ketcherRootCoordinates?.right ?? canvasWrapperRight;

  const width = right - left;
  const height = bottom - top;

  if (ketcherRootLeft === 0 && ketcherRootTop === 0) {
    return calculateLegacyBondPreviewPosition(
      { left, top, right, bottom },
      { canvasWrapperTop, canvasWrapperBottom, canvasWrapperRight },
    );
  }

  let style: PreviewStyle;

  if (width > height) {
    const leftValue = left + width / 2;
    let topValue: number;
    const spaceAbove = top - canvasWrapperTop;
    const spaceBelow = canvasWrapperBottom - bottom;
    if (
      spaceAbove >= preview.heightForBond + preview.gap ||
      spaceAbove >= spaceBelow
    ) {
      topValue = top - preview.heightForBond - preview.gap;
    } else {
      topValue = bottom + preview.gap;
    }

    let horizontalTranslate = '0';

    if (leftValue + preview.widthForBond / 2 > canvasWrapperRight) {
      horizontalTranslate = '-100%';
    } else if (leftValue - preview.widthForBond / 2 >= canvasWrapperLeft) {
      horizontalTranslate = '-50%';
    }

    style = {
      top: `${topValue - ketcherRootTop}px`,
      left: `${leftValue - ketcherRootLeft}px`,
      transform: `translate(${horizontalTranslate}, 0)`,
    };
  } else {
    const topValue = top + height / 2;
    let leftValue: number;
    const spaceOnLeft = left - horizontalBoundaryLeft;
    const spaceOnRight = horizontalBoundaryRight - right;
    if (
      spaceOnLeft >= preview.widthForBond + preview.gap ||
      spaceOnLeft >= spaceOnRight
    ) {
      leftValue = left - preview.widthForBond / 2 - preview.gap;
    } else {
      leftValue = right + preview.widthForBond / 2 + preview.gap;
    }

    const horizontalTranslate = '-50%';
    let verticalTranslate = '0';

    if (topValue + preview.heightForBond / 2 > canvasWrapperBottom) {
      verticalTranslate = '-100%';
    } else if (topValue - preview.heightForBond / 2 >= canvasWrapperTop) {
      verticalTranslate = '-50%';
    }

    style = {
      top: `${topValue - ketcherRootTop}px`,
      left: `${leftValue - ketcherRootLeft}px`,
      transform: `translate(${horizontalTranslate}, ${verticalTranslate})`,
    };
  }

  return style;
}

function calculateLegacyBondPreviewPosition(
  { left, top, right, bottom }: RectCoordinates,
  {
    canvasWrapperTop,
    canvasWrapperBottom,
    canvasWrapperRight,
  }: {
    canvasWrapperTop: number;
    canvasWrapperBottom: number;
    canvasWrapperRight: number;
  },
): PreviewStyle {
  const width = right - left;
  const height = bottom - top;

  if (width > height) {
    const leftValue = left + width / 2;
    const topValue =
      top + canvasWrapperTop > preview.height
        ? top - preview.heightForBond - preview.gap
        : bottom + preview.gap;
    let horizontalTranslate = '0';

    if (leftValue + preview.width > canvasWrapperRight) {
      horizontalTranslate = '-100%';
    } else if (leftValue > preview.width / 2) {
      horizontalTranslate = '-50%';
    }

    return {
      top: `${topValue}px`,
      left: `${leftValue}px`,
      transform: `translate(${horizontalTranslate}, 0)`,
    };
  }

  const topValue = top + height / 2;
  const leftValue =
    left > preview.widthForBond + preview.gap
      ? left - preview.widthForBond / 2 - preview.gap
      : right + preview.widthForBond / 2 + preview.gap;
  const horizontalTranslate = leftValue > preview.width / 2 ? '-50%' : '0';
  let verticalTranslate = '0';

  if (topValue + preview.height / 2 > canvasWrapperBottom) {
    verticalTranslate = '-100%';
  } else if (topValue > preview.height / 2) {
    verticalTranslate = '-50%';
  }

  return {
    top: `${topValue}px`,
    left: `${leftValue}px`,
    transform: `translate(${horizontalTranslate}, ${verticalTranslate})`,
  };
}
