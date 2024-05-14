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
import { MonomerItemType } from 'ketcher-core';
import { EditorClassName } from 'ketcher-react';
import { preview } from '../constants';

// FIXME: Deprecated. Use `calculateMonomerPreviewTop()`.
export const calculatePreviewPosition = (
  monomer: MonomerItemType | undefined,
  target?: DOMRect,
  isNucleosideOrNucleotide = false,
): string => {
  if (monomer && target) {
    const editorRect = getEditorDOMRect();

    if (!editorRect || !target) {
      return '';
    }

    const height = isNucleosideOrNucleotide
      ? preview.heightForNucleotide
      : preview.height;

    const top = calculateTop(target, height);

    return `${top}px`;
  }
  return '';
};

export const calculateMonomerPreviewTop = createCalculatePreviewTopFunction(
  preview.height,
);
export const calculateNucleosideOrNucleotidePreviewTop =
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
    if (!target || !getEditorDOMRect()) {
      return '';
    }

    const top = calculateTop(target, height);
    return `${top}px`;
  };
}

function getEditorDOMRect(): DOMRect | undefined {
  return document.querySelector(`.${EditorClassName}`)?.getBoundingClientRect();
}
