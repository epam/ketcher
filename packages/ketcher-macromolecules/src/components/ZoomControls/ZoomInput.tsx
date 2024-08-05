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
  FocusEvent,
  KeyboardEvent,
  useEffect,
  useCallback,
  RefObject,
} from 'react';
import { StyledInput } from 'components/ZoomControls/styles';
import { shortcuts, updateInputString } from 'components/ZoomControls/helpers';

interface ZoomInputProps {
  onZoomSubmit: () => void;
  currentZoom: number;
  inputRef: RefObject<HTMLInputElement>;
}

export const ZoomInput = ({
  onZoomSubmit,
  currentZoom,
  inputRef,
}: ZoomInputProps) => {
  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      const inputEl = inputRef.current;
      if (!inputEl) return;

      // Prevent bubbling of keyDown events to capture input and Enter, allow bubbling of shortcuts
      const zoomShortcuts = [shortcuts['zoom-out'], shortcuts['zoom-in']];
      if (!zoomShortcuts.includes(event.key))
        event.nativeEvent.stopImmediatePropagation();

      if (event.key === 'Enter') {
        onZoomSubmit();
        inputEl.select();
      }
    },
    [onZoomSubmit, inputRef, shortcuts],
  );

  const onFocusHandler = (event: FocusEvent<HTMLInputElement>) => {
    const el = event.target;
    el.select();
  };

  useEffect(() => {
    const inputEl = inputRef.current;
    updateInputString(currentZoom, inputEl);
    if (document.activeElement === inputEl) {
      inputEl?.select();
    }
  }, [currentZoom, inputRef]);

  // Focus on input field upon mounting
  useEffect(() => {
    const inputEl = inputRef.current;
    inputEl?.focus();
    inputEl?.select();
  }, [inputRef]);

  return (
    <StyledInput
      ref={inputRef}
      data-testid="zoom-value"
      onFocus={onFocusHandler}
      onKeyDown={onKeyDown}
    />
  );
};
