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
import { EditorClassName, preview } from '../constants';
import { MonomerItemType } from 'ketcher-core';

export const calculatePreviewPosition = (
  monomer: MonomerItemType | undefined,
  target?: DOMRect,
): string => {
  if (monomer && target) {
    const editorRect = document
      .querySelector(`.${EditorClassName}`)
      ?.getBoundingClientRect();

    if (!editorRect || !target) {
      return '';
    }

    const top =
      target.top > preview.height + preview.gap
        ? target.top - preview.gap - preview.height - preview.topPadding
        : target.bottom + preview.gap - preview.topPadding;

    const newStyle = `${top}px`;

    return newStyle;
  }
  return '';
};
