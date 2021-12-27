import { useState } from 'react'
import styled from '@emotion/styled'

import { ActionButton } from 'components/shared/ui/actionButton'
import { FormulaInput } from './formulaInput'

// Use theme or constants
const FlexWrapper = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 25px;
  width: 670px;
`

const DropDownDummy = styled('div')`
  min-width: 150px;
  background-color: blue;
  height: 100%;
`

export const AddToCanvas = () => {
  const [inputValue, setInputValue] = useState<string>(
    'CC(C)(O1)C[C@@H](O)[C@@]1(O2)[C@@H](C)[C@'
  )
  return (
    <FlexWrapper>
      <DropDownDummy />
      <FormulaInput inputValue={inputValue} inputHandler={setInputValue} />
      <ActionButton label="Add to Canvas" clickHandler={() => null} />
    </FlexWrapper>
  )
}
