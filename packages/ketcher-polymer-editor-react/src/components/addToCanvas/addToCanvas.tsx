import { useState } from 'react'
import styled from '@emotion/styled'

import { ActionButton } from 'components/shared/ui/actionButton'
import { FormulaInput } from './formulaInput'
import { DropDown } from '../shared/ui/dropDown'

const DROPDOWN_VALUES = [
  'HELM Notation',
  'RNA Sequence',
  'Peptide Sequence',
  'Black'
]

// @TODO Use theme or constants
const FlexWrapper = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 24px;
  width: 670px;
  margin: 0 auto;
`

export const AddToCanvas = () => {
  // @TODO START WITH EMPTY STRING
  const [inputValue, setInputValue] = useState<string>(
    'CC(C)(O1)C[C@@H](O)[C@@]1(O2)[C@@H](C)[C@'
  )
  const [selection, setSelection] = useState<string>(DROPDOWN_VALUES[2])

  return (
    <FlexWrapper>
      <DropDown
        options={DROPDOWN_VALUES}
        currentSelection={selection}
        selectionHandler={setSelection}
      />
      <FormulaInput inputValue={inputValue} inputHandler={setInputValue} />
      <ActionButton label="Add to Canvas" clickHandler={() => null} />
    </FlexWrapper>
  )
}
