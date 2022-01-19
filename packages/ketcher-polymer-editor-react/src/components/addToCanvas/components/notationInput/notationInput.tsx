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

import { useState } from 'react'
import styled from '@emotion/styled'

import { InputBox } from './inputBox'
import { ExpandButton } from './expandButton'
import { TextareaAutoResize } from './textareaAutoResize'

const inputFieldWidth = 355
const inputPadding = 10

const InputFlexContainer = styled('div')`
  height: 100%;
  width: ${inputFieldWidth + inputPadding * 2}px;
  overflow: visible;
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
`

type FormulaInputProps = {
  inputValue: string
  inputHandler: (value: string) => void
}

export const NotationInput = ({
  inputValue,
  inputHandler
}: FormulaInputProps) => {
  const [focused, setFocused] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [isMultiLine, setMultiLine] = useState(false)

  const inputClickHandler = () => {
    if (!expanded) {
      setExpanded(true)
    }
    setFocused(true)
  }

  return (
    <InputFlexContainer>
      <InputBox
        hasInput={Boolean(inputValue)}
        onClick={inputClickHandler}
        onBlur={() => setFocused(false)}>
        <TextareaAutoResize
          inputValue={inputValue}
          maxRows={8}
          inputHandler={inputHandler}
          isFocused={focused}
          isMultiLine={isMultiLine}
          isCollapsed={!expanded}
          setMultiLine={setMultiLine}
        />
      </InputBox>
      {isMultiLine && (
        <ExpandButton
          expandHandler={() => setExpanded((prevState) => !prevState)}
          expanded={expanded}
        />
      )}
    </InputFlexContainer>
  )
}
