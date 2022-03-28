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
  useState,
  useEffect,
  FocusEvent,
  KeyboardEvent,
  useCallback
} from 'react'
import styled from '@emotion/styled'

import { zoomList } from 'src/script/ui/action/zoom'

const percentValidInput = /^\d{0,3}%?$/

const getZoomString = (zoom: number) => {
  return `${Math.round(zoom * 100)}%`
}

const onFocusHandler = (event: FocusEvent<HTMLInputElement>) => {
  const el = event.target
  el.focus()
  el.select()
}

const getAllowedZoom = (value: number): number => {
  const minAllowed = Math.min(...zoomList)
  const maxAllowed = Math.max(...zoomList)

  if (value < minAllowed) {
    return minAllowed
  }

  if (value > maxAllowed) {
    return maxAllowed
  }

  return value
}

const getPercentNumber = (inputValue: string) => {
  return parseInt(inputValue) / 100
}

const ZoomInput = styled('input')`
  padding: 3px 8px;
  color: #585858;
  font-size: 14px;
  line-height: 16px;
  border: 1px solid #cad3dd;
  border-radius: 4px;
  caret-color: #43b5c0;

  &:hover {
    border-color: #43b5c0;
  }
`

interface ZoomInputProps {
  zoom: number
  setZoom: (arg) => void
  isClosing: boolean
  collapseHandler: () => void
}

export const ZoomInputField = ({
  zoom,
  setZoom,
  isClosing,
  collapseHandler
}: ZoomInputProps) => {
  const [inputValue, setInputValue] = useState<string>('')

  const setZoomFromInputString = useCallback(() => {
    let zoomNumber = getPercentNumber(inputValue)
    if (isNaN(zoomNumber)) {
      const currentZoom = getZoomString(zoom)
      setInputValue(currentZoom)
      return
    }
    zoomNumber = getAllowedZoom(zoomNumber)
    setZoom(zoomNumber)
  }, [inputValue, setZoom, zoom])

  useEffect(() => {
    const zoomString = getZoomString(zoom)
    setInputValue(zoomString)
  }, [])

  useEffect(() => {
    if (isClosing) {
      const zoomNumber = getPercentNumber(inputValue)
      if (zoomNumber !== zoom) {
        setZoomFromInputString()
      }
      collapseHandler()
    }
  }, [isClosing, collapseHandler, setZoomFromInputString, inputValue, zoom])

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setZoomFromInputString()
    }
  }

  const inputChangeHandler = (event) => {
    const userValue = event.target.value
    if (percentValidInput.test(userValue)) {
      setInputValue(userValue)
    }
  }

  return (
    <ZoomInput
      pattern="^\d{1,3}%?$"
      onFocus={onFocusHandler}
      placeholder={getZoomString(zoom)}
      onChange={inputChangeHandler}
      value={inputValue}
      onKeyDown={onKeyDown}
    />
  )
}
