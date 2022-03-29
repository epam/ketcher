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

import { ChangeEvent, FocusEvent, KeyboardEvent } from 'react'
import { Input, InputAdornment } from '@mui/material'
import styled from '@emotion/styled'

const threeNumbersInput = /^\d{0,3}$/

const StyledInput = styled(Input)`
  border: 1px solid #cad3dd;
  border-radius: 4px;

  & .MuiInput-input {
    padding: 3px 8px;
    color: #585858;
    font-size: 14px;
    line-height: 16px;
    caret-color: #43b5c0;
  }

  &:hover {
    border-color: #43b5c0;
  }

  &::after,
  &::before {
    display: none;
  }
`

const Adornment = styled(InputAdornment)`
  padding-right: 8px;
`

const onFocusHandler = (event: FocusEvent<HTMLInputElement>) => {
  const el = event.target
  el.focus()
  el.select()
}

interface ZoomInputProps {
  onZoomSubmit: (zoom: number) => void
  zoomInput: number
  setZoomInput: (zoomString: number) => void
}

export const ZoomInput = ({
  onZoomSubmit,
  zoomInput,
  setZoomInput
}: ZoomInputProps) => {
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onZoomSubmit(zoomInput)
    }
  }

  const inputChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const userValue = event.target.value
    if (threeNumbersInput.test(userValue)) {
      const parsedZoom = parseInt(userValue)
      setZoomInput(isNaN(parsedZoom) ? 0 : parsedZoom)
    }
  }

  return (
    <StyledInput
      onFocus={onFocusHandler}
      endAdornment={<Adornment position="end">%</Adornment>}
      onChange={inputChangeHandler}
      value={zoomInput}
      onKeyDown={onKeyDown}
    />
  )
}
