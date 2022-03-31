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

interface ZoomInputProps {
  onZoomSubmit: (zoom: number) => void
  zoomInput: number
}

export const ZoomInput = ({ onZoomSubmit, zoomInput }: ZoomInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const inputField = inputRef.current
    if (inputField) {
      inputRef.current.value = `${zoomInput}%`
    }

    return () => {
      const zoomValue = parseInt(inputField?.value || '')
      if (zoomValue !== zoomInput) {
        onZoomSubmit(zoomValue)
      }
    }
  }, [zoomInput, onZoomSubmit])

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.nativeEvent.stopImmediatePropagation()
    if (event.key === 'Enter') {
      if (inputRef.current?.value) {
        const zoomValue = parseInt(inputRef.current.value)
        onZoomSubmit(zoomValue)
      }
    }
  }

  return (
    <StyledInput
      ref={inputRef}
      onFocus={onFocusHandler}
      defaultValue={`${zoomInput}%`}
      onKeyDownCapture={onKeyDown}
    />
  )
}
