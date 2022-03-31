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

const updateInputAndFocus = (zoom: number, inputElement: HTMLInputElement) => {
  inputElement.value = `${zoom}%`
  inputElement.focus()
  inputElement.select()
}

const getParsedZoomNumber = (zoomInput: string | undefined): number => {
  const zoomNumber = parseInt(zoomInput || '')
  if (isNaN(zoomNumber)) {
    return 0
  }
  return zoomNumber
}

interface ZoomInputProps {
  onZoomSubmit: (zoom: number) => void
  currentZoom: number
}

export const ZoomInput = ({ onZoomSubmit, currentZoom }: ZoomInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const inputField = inputRef.current
    if (inputField) {
      updateInputAndFocus(currentZoom, inputField)
    }
  }, [currentZoom])

  useEffect(() => {
    const inputField = inputRef.current
    return () => {
      const zoomValue = getParsedZoomNumber(inputField?.value)
      if (zoomValue && zoomValue !== currentZoom) {
        onZoomSubmit(zoomValue)
      }
    }
  }, [])

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.nativeEvent.stopImmediatePropagation()
    if (event.key === 'Enter') {
      if (inputRef.current) {
        const zoomValue = getParsedZoomNumber(inputRef.current.value)
        if (zoomValue) {
          onZoomSubmit(zoomValue)
        } else {
          updateInputAndFocus(currentZoom, inputRef.current)
        }
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
