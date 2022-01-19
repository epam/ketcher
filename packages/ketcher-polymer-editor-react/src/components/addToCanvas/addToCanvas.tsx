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

import { DropDown as SelectNotation } from '../shared/ui/dropDown'
import { NotationInput } from './components/notationInput'
import { ActionButton as AddButton } from '../shared/ui/actionButton'

const componentWidth = 670
const height = 24

const NOTATION_OPTIONS = [
  'HELM Notation',
  'RNA Sequence',
  'Peptide Sequence',
  'Black'
]

const AddToCanvasBar = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${height}px;
  width: ${componentWidth}px;
  margin: 0 auto;
`

export const AddToCanvas = () => {
  const [selection, setSelection] = useState<string>(NOTATION_OPTIONS[2])
  const [inputValue, setInputValue] = useState<string>('')

  return (
    <AddToCanvasBar>
      <SelectNotation
        options={NOTATION_OPTIONS}
        currentSelection={selection}
        selectionHandler={setSelection}
      />
      <NotationInput inputValue={inputValue} inputHandler={setInputValue} />
      <AddButton
        label="Add to Canvas"
        clickHandler={() => null}
        disabled={!inputValue}
      />
    </AddToCanvasBar>
  )
}
