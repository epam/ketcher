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

import { useCallback, useEffect, useRef, useState } from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import 'overlayscrollbars/css/OverlayScrollbars.css'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

const lineHeight = 16
const inputFieldWidth = 355
const inputPadding = 10

const commonStyles = `
  line-height: ${lineHeight}px;
  width: ${inputFieldWidth - inputPadding * 2}px;
  border: none;
  resize: none;
  padding: 0;
  padding-right: 10px;
  overflow: hidden;
  height: inherit;
`

const VisibleTextInput = styled('textarea')<{
  shouldHideOverflow: boolean
}>`
  ${commonStyles}

  outline: none; // when in focus, parent div has blue border

  ${({ shouldHideOverflow }) =>
    shouldHideOverflow
      ? css`
          white-space: nowrap;
          overflow: hidden;
        `
      : null}
`

// invisible textarea to dynamically calculate height
const HiddenArea = styled('textarea')`
  ${commonStyles};

  // Making invisible, removing from content flow
  visibility: hidden;
  position: absolute;
  height: 0;
  top: 0;
  left: 0;
  transform: translateZ(0);
`

const Ellipsis = styled('span')<{ shouldDisplay: boolean }>`
  ${({ shouldDisplay, theme }) =>
    shouldDisplay
      ? css`
          display: inline-block;
          position: absolute;
          right: 0;
          font-size: ${theme.ketcher.font.size.medium};
          line-height: ${lineHeight}px;
          padding-left: 3px;
          padding-right: ${inputPadding}px;
          background-color: ${theme.ketcher.color.background.primary};
          box-shadow: -3px 0 5px 2px ${theme.ketcher.color.background.primary};
        `
      : `display: none`}
`

type Props = {
  inputValue: string
  inputHandler: (value: string) => void
  isFocused: boolean
  isMultiLine: boolean
  isCollapsed: boolean
  setMultiLine: (value: boolean) => void
  maxRows: number
}

export const TextareaAutoResize = ({
  inputValue,
  inputHandler,
  isFocused,
  isMultiLine,
  isCollapsed,
  setMultiLine,
  maxRows
}: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hiddenRef = useRef<HTMLTextAreaElement>(null)
  const [newHeight, setNewHeight] = useState(lineHeight)
  const [oneLineHeight, setOneLineHeight] = useState(lineHeight)

  const updateHeight = useCallback(() => {
    const textarea = textareaRef.current
    const hiddenTextarea = hiddenRef.current

    if (!textarea || !hiddenTextarea) {
      return
    }

    hiddenTextarea.value = ' '
    const oneLineHeight = hiddenTextarea.scrollHeight
    setOneLineHeight(oneLineHeight)

    hiddenTextarea.value = inputValue
    const scrollHeight = hiddenTextarea.scrollHeight
    hiddenTextarea.value = ' '

    const newHeight = isCollapsed ? oneLineHeight : scrollHeight

    setNewHeight(newHeight)

    // Informing parent if content needs more than 1 line
    const hasSeveralRows = scrollHeight / oneLineHeight > 1
    setMultiLine(hasSeveralRows)
  }, [inputValue, setMultiLine, isCollapsed])

  useEffect(() => {
    updateHeight()
  }, [updateHeight])

  useEffect(() => {
    const textarea = textareaRef.current
    if (isFocused && textarea) {
      textarea.focus()
    }
  }, [isFocused])

  const onChangeHandler = (event) => {
    inputHandler(event.target.value)
  }
  return (
    <>
      <OverlayScrollbarsComponent
        options={
          {
            // className: 'os-theme-none'
            // scrollbars: {
            //   autoHide: 'never'
            // }
          }
        }
      >
        <div
          style={{
            height: `${newHeight}px`,
            maxHeight: `${maxRows * oneLineHeight}px`
          }}
        >
          <VisibleTextInput
            ref={textareaRef}
            value={inputValue}
            onChange={onChangeHandler}
            shouldHideOverflow={isMultiLine && isCollapsed}
          />
        </div>
      </OverlayScrollbarsComponent>

      <Ellipsis shouldDisplay={isMultiLine && isCollapsed}>...</Ellipsis>
      <HiddenArea aria-hidden="true" ref={hiddenRef} />
    </>
  )
}
