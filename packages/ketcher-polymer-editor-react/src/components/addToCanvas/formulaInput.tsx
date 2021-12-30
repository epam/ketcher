import { useEffect, useRef, useState } from 'react'
import { TextareaAutosize } from '@mui/material'
import styled from '@emotion/styled'

import { TextareaWrapper } from './textareaWrapper'
import { CONSTANTS } from './stylingHelpers'

const { lineHeight, inputFieldWidth, inputPadding } = CONSTANTS

// @TODO: grab values from emotion theme when it's ready
const FormulaWrapper = styled('div')`
  height: 100%;
  width: ${inputFieldWidth}px;
  overflow: visible;
  position: relative;

  & span {
    font-size: 14px;
    min-height: ${lineHeight}px;
    border: none;
    width: ${inputFieldWidth - inputPadding * 2}px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

const FormulaTextField = styled(TextareaAutosize)`
  font-size: 14px;
  line-height: ${lineHeight}px;
  width: ${inputFieldWidth - inputPadding * 2}px;
  border: none;
  resize: none;
  padding: 0;

  // when in focus, parent div has border
  outline: none;
`

type FormulaInputProps = {
  inputValue: string
  inputHandler: (value: string) => void
}

export const FormulaInput = ({
  inputValue,
  inputHandler
}: FormulaInputProps) => {
  const [focused, setFocused] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const onChangeHandler = (event) => {
    inputHandler(event.target.value)
  }

  const inputClickHandler = () => {
    if (!expanded) {
      setExpanded(true)
    }
    setFocused(true)
  }

  useEffect(() => {
    const el = textareaRef.current
    console.log('Use effect')
    // focus and place cursor to the end of textarea
    if (el && focused && typeof el.selectionStart === 'number') {
      el.focus()
      el.selectionStart = el.selectionEnd = el.value.length
    }
  }, [focused])

  // @TODO add clickable arrow to expand/collapse input text
  return (
    <>
      <FormulaWrapper>
        <TextareaWrapper
          hasInput={Boolean(inputValue)}
          onClick={inputClickHandler}
          onBlur={() => setFocused(false)}>
          {expanded ? (
            <FormulaTextField
              ref={textareaRef}
              value={inputValue}
              maxRows={8}
              onChange={onChangeHandler}
            />
          ) : (
            <span>{inputValue}</span>
          )}
        </TextareaWrapper>
      </FormulaWrapper>
      {/* Make button component instead of this */}
      <button onClick={() => setExpanded((prevState) => !prevState)}>⬆</button>
    </>
  )
}
