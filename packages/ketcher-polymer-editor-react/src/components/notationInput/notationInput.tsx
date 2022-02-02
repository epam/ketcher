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

import { DropDown as SelectNotation } from '../shared/ui/dropDown'
import { InputArea } from './inputArea'
import { ActionButton as AddButton } from '../shared/ui/actionButton'

const componentWidth = 670
const height = 24

const AddToCanvasBar = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${height}px;
  width: ${componentWidth}px;
`

type AddToCanvasProps = {
  notationOptions: Array<{ id: number; label: string }>
  selectedNotationId: number
  selectionHandler: (value: number) => void
  inputValue: string
  inputHandler: (value: string) => void
  addButtonHandler: () => void
}

export const NotationInput = ({
  notationOptions,
  selectedNotationId,
  selectionHandler,
  inputValue,
  inputHandler,
  addButtonHandler
}: AddToCanvasProps) => {
  return (
    <AddToCanvasBar>
      <SelectNotation
        options={notationOptions}
        currentSelection={selectedNotationId}
        selectionHandler={selectionHandler}
      />
      <InputArea inputValue={inputValue} inputHandler={inputHandler} />
      <AddButton
        label="Add to Canvas"
        clickHandler={addButtonHandler}
        disabled={!inputValue}
      />
    </AddToCanvasBar>
  )
}
