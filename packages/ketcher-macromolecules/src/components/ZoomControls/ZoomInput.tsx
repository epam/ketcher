/****************************************************************************
 * Copyright 2021 EPAM Systems
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

import {
  FocusEvent,
  KeyboardEvent,
  useEffect,
  useCallback,
  RefObject,
} from 'react';
import { isTouchDevice } from 'ketcher-react';
import { StyledInput } from 'components/ZoomControls/styles';
import { hotkeysShortcuts } from 'components/ZoomControls/helpers';

interface ZoomInputProperties {
  onZoomSubmit: () => void;
  currentZoom: number;
  inputRef: RefObject<HTMLInputElement>;
}

export const ZoomInput = ({
  onZoomSubmit,
  currentZoom,
  inputRef,
}: ZoomInputProperties) => {
  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      const inputElement = inputRef.current;
      if (!inputElement) return;

      // Prevent bubbling of keyDown events to capture input and Enter, allow bubbling of shortcuts
      const zoomShortcuts = [
        hotkeysShortcuts['zoom-out'],
        hotkeysShortcuts['zoom-in'],
      ];
      if (!zoomShortcuts.includes(event.key))
        event.nativeEvent.stopImmediatePropagation();

      if (event.key === 'Enter') {
        onZoomSubmit();
        inputElement.select();
      }
    },
    [onZoomSubmit, inputRef],
  );

  const onFocusHandler = (event: FocusEvent<HTMLInputElement>) => {
    const element = event.target;
    element.select();
  };

  // Focus on input field upon mounting (skip on touch devices to avoid virtual keyboard)
  useEffect(() => {
    const inputElement = inputRef.current;
    if (!isTouchDevice) {
      inputElement?.focus();
      inputElement?.select();
    }
  }, [inputRef]);

  return (
    <StyledInput
      ref={inputRef}
      data-testid="zoom-value"
      defaultValue={`${currentZoom}%`}
      onFocus={onFocusHandler}
      onKeyDown={onKeyDown}
      inputMode="numeric"
    />
  );
};
