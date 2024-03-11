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
import { preview } from '../constants';
import { EditorClassName } from 'ketcher-react';
import { MonomerItemType } from 'ketcher-core';

export const calculatePreviewPosition = (
  monomer: MonomerItemType | undefined,
  target?: DOMRect,
  isNucleosideOrNucleotide = false,
): string => {
  if (monomer && target) {
    const editorRect = document
      .querySelector(`.${EditorClassName}`)
      ?.getBoundingClientRect();

    if (!editorRect || !target) {
      return '';
    }

    const height = isNucleosideOrNucleotide
      ? preview.heightForNucleotide
      : preview.height;

    const top =
      target.top > preview.height + preview.gap + preview.topPadding
        ? target.top - preview.gap - height
        : target.bottom + preview.gap;

    const newStyle = `${top}px`;

    return newStyle;
  }
  return '';
};
