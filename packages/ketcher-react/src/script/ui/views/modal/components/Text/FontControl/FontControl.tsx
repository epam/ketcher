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
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import { useClickOutside } from '../../../../../../../hooks/useClickOutside';
import { type LexicalEditor, $getSelection, $isRangeSelection } from 'lexical';
import {
  $patchStyleText,
  $getSelectionStyleValueForProperty,
} from '@lexical/selection';

import classes from './FontControl.module.less';

import { range } from 'lodash/fp';

const DEFAULT_FONT_SIZE = '13px';
const MIN_FONT_SIZE = 4;
const MAX_FONT_SIZE = 144;
const fontSizes = range(MIN_FONT_SIZE, MAX_FONT_SIZE + 1);

export const FontControl = ({ editor }: { editor: LexicalEditor }) => {
  const [isShowingFontSizeMenu, setIsShowingFontSizeMenu] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState(DEFAULT_FONT_SIZE);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const onClickOutsideCloseDrowndown = (): void =>
    setIsShowingFontSizeMenu(false);

  useClickOutside(wrapperRef, onClickOutsideCloseDrowndown);

  const setFontSize = useCallback(
    (e: MouseEvent, value: string) => {
      e.preventDefault();
      setCurrentFontSize(value);
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, { 'font-size': value });
        }
      });
      setIsShowingFontSizeMenu(false);
    },
    [editor],
  );

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const fontSize = $getSelectionStyleValueForProperty(
            selection,
            'font-size',
            DEFAULT_FONT_SIZE,
          );
          setCurrentFontSize(fontSize);
        }
      });
    });
  }, [editor]);

  const fontSizeOptions = useMemo(
    () =>
      fontSizes.map((fontSize) => (
        <button
          key={fontSize}
          type="button"
          className={classes.fontSizeOption}
          onMouseDown={(e) => setFontSize(e, `${fontSize}px`)}
          data-testid={`${fontSize}-option`}
        >
          {fontSize}
        </button>
      )),
    [setFontSize],
  );

  return (
    <div ref={wrapperRef}>
      <button
        data-testid="font-size-button"
        className={classes.fontBtn}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsShowingFontSizeMenu(!isShowingFontSizeMenu);
        }}
      >
        {parseFloat(currentFontSize)}
      </button>
      {isShowingFontSizeMenu ? (
        <div className={classes.fontSizeMenu}>{fontSizeOptions}</div>
      ) : null}
    </div>
  );
};

export default FontControl;
