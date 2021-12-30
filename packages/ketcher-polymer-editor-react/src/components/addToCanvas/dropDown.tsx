import { useState, CSSProperties } from 'react'
import { Select, FormControl, MenuItem, ListItemText } from '@mui/material'
import styled from '@emotion/styled'

import { CONSTANTS } from './stylingHelpers'

// @TODO ====== MAKE DROPDOWN COMPONENT A SHARED ONE ======

const LIST_VALUES = [
  'HELM Notation',
  'RNA Sequence',
  'Peptide Sequence',
  'Black'
]

const CheckMarkSvg = ({ isSelected }: { isSelected: boolean }) => {
  if (!isSelected) {
    return null
  }

  // @TODO use Icon component as we normally do, remove fill and style here
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.33997 6.80349L6.39998 9.85683L12.6635 3.59998L13.6035 4.53998L6.39998 11.7435L2.39999 7.74349L3.33997 6.80349Z"
        fill="#343434"
      />
    </svg>
  )
}

const DropDownItem = styled(MenuItem)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 8px 0 8px;
  height: ${CONSTANTS.height}px;
  & .MuiTypography-root {
    font-size: ${CONSTANTS.dropDownFont}px;
  }
`

const DropDownSelect = styled(Select)`
  width: 150px;
  height: ${CONSTANTS.height}px;
  border: 1px solid #5b6077;
  border-radius: 2px;
  ${({ open }) =>
    open &&
    `background-color: white;
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;`}

  & .MuiSelect-select {
    padding: 0 24px 0 8px;
    height: 100%;
    /* line-height: ${CONSTANTS.height}px; // to center text that MUI puts in a div */
  }

  & span {
    font-size: ${CONSTANTS.dropDownFont}px;
  }

  & .MuiOutlinedInput-notchedOutline {
    border: 0;
  }
`

const stylesForExpanded: CSSProperties = {
  width: '120px',
  backgroundColor: 'white',
  border: '1px solid #5B6077',
  borderRadius: '0px 0px 2px 2px',
  boxShadow: 'none'
}

export const DropDown = () => {
  const [expanded, setExpanded] = useState(false)
  const [selection, setSelection] = useState<string>(LIST_VALUES[0])
  console.log(selection)

  const handleSelection = (event) => {
    setSelection(event.target.value)
  }

  const handleExpand = () => {
    setExpanded(true)
  }

  const handleCollapse = () => {
    setExpanded(false)
  }

  return (
    <FormControl>
      <DropDownSelect
        value={selection}
        onChange={handleSelection}
        open={expanded}
        onOpen={handleExpand}
        onClose={handleCollapse}
        renderValue={(value) => <span>{value as string}</span>}
        fullWidth
        MenuProps={{
          PaperProps: {
            style: stylesForExpanded
          }
        }}>
        {LIST_VALUES.map((item) => (
          <DropDownItem key={item} value={item}>
            <ListItemText primary={item} />
            <CheckMarkSvg isSelected={item === selection} />
          </DropDownItem>
        ))}
      </DropDownSelect>
    </FormControl>
  )
}
