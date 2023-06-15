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

import { useState, CSSProperties } from 'react'
import { Select, FormControl, MenuItem, ListItemText } from '@mui/material'
import styled from '@emotion/styled'
import { css } from '@emotion/react'

import { ChevronIcon, CheckMarkIcon } from './styledIcons'

const DropDownSelect = styled(Select)`
  width: 150px;
  height: 24px;
  border: 1px solid #5b6077;
  border-radius: 2px;
  ${({ open }) =>
    open &&
    css`
      background-color: white;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    `}

  & .MuiSelect-select {
    padding: 0 24px 0 8px;
    height: 100%;
  }

  & span {
    ${({ theme }) => `font-size: ${theme.ketcher.font.size.regular}`}
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
    ${({ theme }) => `font-size: ${theme.ketcher.font.size.regular}`}
  }
`

export type Option = {
  id: string
  label: string
}

export type DropDownProps = {
  options: Array<Option>
  currentSelection: Option['id']
  selectionHandler: (value: Option['id']) => void
  className?: string
  customStylesForExpanded?: CSSProperties
}

export const DropDown = ({
  options,
  currentSelection,
  selectionHandler,
  className,
  customStylesForExpanded = {}
}: DropDownProps) => {
  const [expanded, setExpanded] = useState(false)

  const renderLabelById = (value: unknown) => {
    const selectedOption = options.filter(
      (option) => option.id === (value as typeof currentSelection)
    )[0]

    return <span>{selectedOption.label}</span>
  }

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
    <FormControl className={className}>
      <DropDownSelect
        value={currentSelection}
        onChange={handleSelection}
        open={expanded}
        onOpen={handleExpand}
        onClose={handleCollapse}
        renderValue={renderLabelById}
        IconComponent={ChevronIcon}
        fullWidth
        data-testid="dropdown-select"
        MenuProps={{
          PaperProps: {
            style: { ...stylesForExpanded, ...customStylesForExpanded }
          },
          MenuListProps: {
            style: { padding: '0' }
          }
        }}
      >
        {options.map((item: Option) => (
          <DropDownItem key={item.id} value={item.id}>
            <ListItemText primary={item.label} />
            <CheckMarkIcon isSelected={item.id === currentSelection} />
          </DropDownItem>
        ))}
      </DropDownSelect>
    </FormControl>
  )
}
