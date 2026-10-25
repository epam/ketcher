/* eslint-disable react-you-might-not-need-an-effect/no-event-handler */
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
  type FocusEvent,
  type KeyboardEvent,
  type RefObject,
  useEffect,
  useCallback,
} from 'react';
import styled from '@emotion/styled';
import { isTouchDevice } from '../../../../../utilities';

const StyledInput = styled('input')`
  border: 1px solid #cad3dd;
  border-radius: 4px;
  padding: 3px 8px;
  color: #585858;
  font-size: 14px;
  line-height: 16px;
  caret-color: #43b5c0;
  margin-bottom: 8px;

  &:hover {
    border-color: #43b5c0;
  }

  &:active,
  &:focus {
    border-color: #167782;
    outline: none;
  }

  &::after,
  &::before {
    display: none;
  }
`;

const onFocusHandler = (event: FocusEvent<HTMLInputElement>) => {
  const element = event.target;
  element.select();
};

export const updateInputString = (
  zoom: number,
  inputElement: HTMLInputElement | null,
) => {
  if (!inputElement) return;
  inputElement.value = `${zoom}%`;
};

export interface ZoomInputProperties {
  onZoomSubmit: () => void;
  currentZoom: number;
  inputRef: RefObject<HTMLInputElement>;
  shortcuts: { [key in string]: string };
}

export const ZoomInput = ({
  onZoomSubmit,
  currentZoom,
  inputRef,
  shortcuts,
}: ZoomInputProperties) => {
  useEffect(() => {
    const inputElement = inputRef.current;
    updateInputString(currentZoom, inputElement);
    if (document.activeElement === inputElement) {
      inputElement?.select();
    }
  }, [currentZoom, inputRef]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      const inputElement = inputRef.current;
      if (!inputElement) {
        return;
      }

      // Prevent bubbling of keyDown events to capture input and Enter, allow bubbling of shortcuts
      const zoomShortcuts = [shortcuts['zoom-out'], shortcuts['zoom-in']];
      if (!zoomShortcuts.includes(event.key)) {
        event.nativeEvent.stopImmediatePropagation();
      }

      if (event.key === 'Enter') {
        onZoomSubmit();
        inputElement.select();
      }
    },
    [onZoomSubmit, inputRef, shortcuts],
  );

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
      onFocus={onFocusHandler}
      onKeyDown={onKeyDown}
      inputMode="numeric"
    />
  );
};
