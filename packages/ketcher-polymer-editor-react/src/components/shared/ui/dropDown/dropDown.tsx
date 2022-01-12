import { useState, CSSProperties } from 'react'
import { Select, FormControl, MenuItem, ListItemText } from '@mui/material'
import styled from '@emotion/styled'

import { ChevronIcon, CheckMarkIcon } from './components'

const DropDownSelect = styled(Select)`
  width: 150px;
  height: 24px;
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
  }

  & span {
    font-size: 12px;
  }

  & .MuiOutlinedInput-notchedOutline {
    border: 0;
  }
`

const stylesForExpanded: CSSProperties = {
  width: '120px',
  backgroundColor: 'white',
  border: '1px solid #5B6077',
  borderTopWidth: '0',
  borderRadius: '0px 0px 2px 2px',
  boxShadow: 'none'
}

const DropDownItem = styled(MenuItem)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 8px 0 8px;
  height: 24px;
  & .MuiTypography-root {
    font-size: 12px;
  }
`

type DropDownProps = {
  options: Array<string>
  currentSelection: string
  selectionHandler: (value: string) => void
}

export const DropDown = ({
  options,
  currentSelection,
  selectionHandler
}: DropDownProps) => {
  const [expanded, setExpanded] = useState(false)

  const handleSelection = (event) => {
    selectionHandler(event.target.value)
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
        value={currentSelection}
        onChange={handleSelection}
        open={expanded}
        onOpen={handleExpand}
        onClose={handleCollapse}
        renderValue={(value) => <span>{value as string}</span>}
        IconComponent={ChevronIcon}
        fullWidth
        MenuProps={{
          PaperProps: {
            style: stylesForExpanded
          }
        }}>
        {options.map((item) => (
          <DropDownItem key={item} value={item}>
            <ListItemText primary={item} />
            <CheckMarkIcon isSelected={item === currentSelection} />
          </DropDownItem>
        ))}
      </DropDownSelect>
    </FormControl>
  )
}
