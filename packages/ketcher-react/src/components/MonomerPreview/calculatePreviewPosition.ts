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
import { AmbiguousMonomerType, PolymerBond, ZoomTool } from 'ketcher-core';
import { preview } from './constants';
import { PreviewStyle } from './AmbiguousMonomerPreview/types';
import assert from 'assert';
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
  const canvasWrapperBottom = canvasWrapperBoundingClientRect?.bottom ?? 0;
  const canvasWrapperTop = canvasWrapperBoundingClientRect?.top ?? 0;
  const canvasWrapperRight = canvasWrapperBoundingClientRect?.right ?? 0;

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
    const leftValue = left + width / 2;
    let topValue: number;
    if (top + canvasWrapperTop > preview.height) {
      topValue = top - preview.heightForBond - preview.gap;
    } else {
      topValue = bottom + preview.gap;
    }

    let horizontalTranslate = '0';

    if (leftValue + preview.width > canvasWrapperRight) {
      horizontalTranslate = '-100%';
    } else if (leftValue > preview.width / 2) {
      horizontalTranslate = '-50%';
    }

    style = {
      top: `${topValue}px`,
      left: `${leftValue}px`,
      transform: `translate(${horizontalTranslate}, 0)`,
    };
  } else {
    const topValue = top + height / 2;
    let leftValue: number;
    if (left > preview.widthForBond + preview.gap) {
      leftValue = left - preview.widthForBond / 2 - preview.gap;
    } else {
      leftValue = right + preview.widthForBond / 2 + preview.gap;
    }

    const horizontalTranslate = leftValue > preview.width / 2 ? '-50%' : '0';
    let verticalTranslate = '0';

    if (topValue + preview.height / 2 > canvasWrapperBottom) {
      verticalTranslate = '-100%';
    } else if (topValue > preview.height / 2) {
      verticalTranslate = '-50%';
    }

    style = {
      top: `${topValue}px`,
      left: `${leftValue}px`,
      transform: `translate(${horizontalTranslate}, ${verticalTranslate})`,
    };
  }

  return style;
};
