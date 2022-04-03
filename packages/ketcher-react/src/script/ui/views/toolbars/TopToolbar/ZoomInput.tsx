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
  useRef,
  FocusEvent,
  KeyboardEvent,
  useEffect,
  useCallback
} from 'react'
import styled from '@emotion/styled'

import { zoomList } from 'src/script/ui/action/zoom'

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

  &::after,
  &::before {
    display: none;
  }
`

const onFocusHandler = (event: FocusEvent<HTMLInputElement>) => {
  const el = event.target
  el.select()
}

const updateInput = (zoom: number, inputElement: HTMLInputElement | null) => {
  if (!inputElement) return
  inputElement.value = `${zoom}%`
}

// const focusAndSelect = (element: HTMLInputElement | null) => {
//   if (!element) return
//   element.focus()
//   element.select()
// }

const getIntegerFromString = (zoomInput: string | undefined): number => {
  const zoomNumber = parseInt(zoomInput || '')
  if (isNaN(zoomNumber)) {
    return 0
  }
  return zoomNumber
}

const getValidZoom = (zoom: number, currentZoom: number): number => {
  if (zoom === 0) {
    return currentZoom
  }

  const minAllowed = Math.min(...zoomList) * 100
  const maxAllowed = Math.max(...zoomList) * 100

  if (zoom < minAllowed) {
    return minAllowed
  }
  if (zoom > maxAllowed) {
    return maxAllowed
  }
  return zoom
}

interface ZoomInputProps {
  onZoom: (zoom: number) => void
  currentZoom: number
}

export const ZoomInput = ({ onZoom, currentZoom }: ZoomInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const inputEl = inputRef.current
    updateInput(currentZoom, inputEl)
    if (document.activeElement === inputEl) {
      inputEl?.select()
    }
    return () => {
      // On unmount, check if input is valid. If yes, set zoom to current input
      const userInput = getIntegerFromString(inputEl?.value)
      if (userInput && userInput !== currentZoom) {
        const zoomToSet = getValidZoom(userInput, currentZoom)
        onZoom(zoomToSet)
      }
    }
  }, [currentZoom, onZoom])

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      const inputEl = inputRef.current
      if (!inputEl) {
        return
      }

      if (event.key === 'Escape') {
        // On Esc press, restore zoom input to current zoom and bubble event up to trigger dropdown close.
        // Restoring input is needed to prevent useEffect cleanup func from dispatching last zoom on unmount.
        updateInput(currentZoom, inputEl)
      } else {
        // Prevent bubbling of all other keyDown events to capture input and Enter
        event.nativeEvent.stopImmediatePropagation()

        // On Enter press, validate input and dispatch zoom update
        if (event.key === 'Enter') {
          const userInput = getIntegerFromString(inputEl.value)
          if (userInput !== 0) {
            const zoomToSet = getValidZoom(userInput, currentZoom)
            updateInput(zoomToSet, inputEl)
            onZoom(zoomToSet)
          } else {
            // If input is invalid, restore current zoom value
            updateInput(currentZoom, inputEl)
          }
          inputEl.select()
        }
      }
    },
    [currentZoom, onZoom]
  )

  // Focus on input field upon mounting
  useEffect(() => {
    const inputEl = inputRef.current
    // focusAndSelect(inputEl)
    inputEl?.focus()
    inputEl?.select()
  }, [])

  return (
    <StyledInput
      ref={inputRef}
      onFocus={onFocusHandler}
      onKeyDown={onKeyDown}
    />
  )
}
