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

import { useRef, FocusEvent, KeyboardEvent, useEffect } from 'react'
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
  el.focus()
  el.select()
}

const updateInput = (zoom: number, inputElement: HTMLInputElement) => {
  inputElement.value = `${zoom}%`
}

const setFocus = (inputElement: HTMLInputElement | null) => {
  if (!inputElement) return
  inputElement.focus()
  inputElement.select()
}

const getParsedInputNumber = (zoomInput: string | undefined): number => {
  const zoomNumber = parseInt(zoomInput || '')
  if (isNaN(zoomNumber)) {
    return 0
  }
  return zoomNumber
}

const getValidZoom = (zoom: number): number => {
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

const getValidZoomFromInput = (
  inputZoom: string | undefined,
  currentZoom: number
) => {
  const parsedInput = getParsedInputNumber(inputZoom)

  if (parsedInput === 0) {
    return currentZoom
  }
  const zoomValue = getValidZoom(parsedInput)
  return zoomValue
}

interface ZoomInputProps {
  onZoomSubmit: (zoom: number) => void
  currentZoom: number
}

export const ZoomInput = ({ onZoomSubmit, currentZoom }: ZoomInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const inputEl = inputRef.current
    const parsedInput = getParsedInputNumber(inputRef.current?.value)
    console.log(parsedInput, currentZoom)
    if (inputEl && parsedInput !== currentZoom) {
      updateInput(currentZoom, inputEl)
    }
    return () => {
      const parsedInput = getParsedInputNumber(inputEl?.value)
      if (parsedInput && parsedInput !== currentZoom) {
        const zoomToSet = getValidZoomFromInput(inputEl?.value, currentZoom)
        onZoomSubmit(zoomToSet)
      }
    }
  }, [currentZoom, onZoomSubmit])

  useEffect(() => {
    const inputEl = inputRef.current
    setFocus(inputEl)
  }, [])

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.nativeEvent.stopImmediatePropagation()
    const inputEl = inputRef.current
    if (event.key === 'Enter') {
      if (inputEl) {
        const parsedInput = getParsedInputNumber(inputEl.value)
        if (parsedInput !== 0) {
          const zoomToSet = getValidZoomFromInput(inputEl.value, currentZoom)
          updateInput(zoomToSet, inputEl)
          onZoomSubmit(zoomToSet)
        } else {
          updateInput(currentZoom, inputEl)
        }
        setFocus(inputEl)
      }
    }
  }

  return (
    <StyledInput
      ref={inputRef}
      onFocus={onFocusHandler}
      onKeyDownCapture={onKeyDown}
    />
  )
}
