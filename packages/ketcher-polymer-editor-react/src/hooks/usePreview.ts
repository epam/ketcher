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
import { RefObject, useState } from 'react';
import { EditorClassName, preview } from '../constants';
import { MonomerItemType } from '../components/monomerLibrary/monomerLibraryItem/types';
import { PreviewStyle } from '../types';

export const usePreview = (
  ref: RefObject<HTMLDivElement>
): [
  monomer: MonomerItemType | undefined,
  previewStyle: PreviewStyle | undefined,
  setPreview: (item?: MonomerItemType, rect?: DOMRect) => void
] => {
  const [previewMonomer, setPreviewMonomer] = useState<
    MonomerItemType | undefined
  >();
  const [previewStyle, setPreviewStyle] = useState<PreviewStyle | undefined>();

  const setPreview = (monomer?: MonomerItemType, rect?: DOMRect) => {
    if (monomer && rect && ref.current) {
      const editorRect = document
        .querySelector(`.${EditorClassName}`)
        ?.getBoundingClientRect();

      if (!editorRect || !rect) {
        return;
      }

      const top =
        editorRect.bottom > rect.bottom + preview.height + preview.gap
          ? rect.bottom - ref.current.getBoundingClientRect().top + preview.gap
          : rect.top -
            ref.current.getBoundingClientRect().top -
            preview.height -
            preview.gap;

      const newStyle = { top: `${top}px` };
      setPreviewMonomer(monomer);
      setPreviewStyle(newStyle);
    } else {
      setPreviewMonomer(undefined);
      setPreviewStyle(undefined);
    }
  };

  return [previewMonomer, previewStyle, setPreview];
};
