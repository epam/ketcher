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
import { ClickAwayListener, Collapse, IconButton } from '@mui/material'
import styled from '@emotion/styled'

import Icon from 'src/script/ui/component/view/icon'

const ElementAndDropdown = styled('div')`
  position: relative;
`

const DropDownContent = styled('div')`
  display: flex;
  position: absolute;
  left: 5px;
  border-radius: 2px;
  flex-direction: column;
  z-index: 20;
  white-space: nowrap;
  word-break: keep-all;
  padding: 2px;
  background: white; // TODO use variable
  border: 1px solid gray; // TODO use variable
  border-radius: 5px;
  box-shadow: 0 6px 12px rgb(0 0 0 / 18%);
`

const DropDownButton = styled(IconButton)`
  position: absolute;
  padding: 0;
  right: 0;
  bottom: 0;

  &.disabled {
    cursor: not-allowed;
    opacity: 0.5;
    background-color: initial;
    color: #333;
    pointer-events: auto;
  }
`

const DropDownArrow = styled(Icon)`
  display: block;
  width: 7px;
  height: 7px;
  margin: 1px;

  &:hover {
    fill: #005662;
    transform: none;
    box-shadow: none;
    transition: none;
    background: none;
  }

  &svg {
    width: 100%;
    height: 100%;
  }

  &svg path {
    fill: inherit;
  }
`

interface ElementWithDropdownProps {
  topElement: JSX.Element
  dropDownElements: JSX.Element | JSX.Element[]
}

export const ElementWithDropdown = ({
  topElement,
  dropDownElements
}: ElementWithDropdownProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  const collapse = () => {
    setIsExpanded(false)
  }

  const expand = () => {
    setIsExpanded(true)
  }

  return (
    <ElementAndDropdown>
      {topElement}
      <DropDownButton
        onClick={expand}
        className={`expanded ${topElement.props.disabled ? 'disabled' : ''}`}
      >
        {!isExpanded && <DropDownArrow name="dropdown" />}
      </DropDownButton>
      <Collapse in={isExpanded} timeout="auto" onClick={collapse} unmountOnExit>
        <ClickAwayListener onClickAway={collapse}>
          <DropDownContent>{dropDownElements}</DropDownContent>
        </ClickAwayListener>
      </Collapse>
    </ElementAndDropdown>
  )
}
