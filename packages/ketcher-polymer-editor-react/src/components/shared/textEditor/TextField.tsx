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

import styled from '@emotion/styled'
import { scrollbarThin } from 'theming/mixins'
import { useEffect, useRef } from 'react'

export type TextEditorProps = {
  struct: string
  inputHandler?: (str: string) => void
  readonly?: boolean
  selectOnInit?: boolean
}

const StyledTextarea = styled.textarea`
  width: 100%;
  height: 100%;
  overflow: auto;
  white-space: pre;
  resize: none;
  box-sizing: border-box;
  outline: transparent;
  border: none;
  padding: 8px;
  color: ${({ theme }) => theme.ketcher.color.input.text.rested};
  font-size: ${({ theme }) => theme.ketcher.font.size.regular};

  ${({ theme }) => scrollbarThin(theme)};

  &:hover {
    cursor: ${(props) => props.readOnly && 'not-allowed'};
  }
`

export const TextField = ({
  struct,
  inputHandler,
  readonly = false,
  selectOnInit = false
}: TextEditorProps) => {
  const textArea = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (selectOnInit) {
      textArea.current?.select()
    }
  }, [textArea, struct, selectOnInit])

  return (
    <StyledTextarea
      value={struct}
      readOnly={readonly}
      onChange={inputHandler && ((event) => inputHandler(event.target.value))}
      ref={textArea}
    />
  )
}
