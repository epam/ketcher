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

import { useState, useRef, useCallback } from 'react'
import styled from '@emotion/styled'
import { Button, Popover } from '@mui/material'

import Icon from 'src/script/ui/component/view/icon'
import { ZoomInput } from './ZoomInput'

const ElementAndDropdown = styled('div')`
  position: relative;
`

const DropDownButton = styled(Button)`
  display: flex;
  color: #000000;
  padding-right: 0;
  padding-left: 0;

  & svg {
    margin-left: 2px;
    width: 16px;
    height: 16px;
  }
`

const ZoomLabel = styled('span')`
  width: 35px;
`

const Dropdown = styled(Popover)`
  & .MuiPopover-paper {
    padding: 8px;
    width: 135px;
    border: none;
    border-radius: 0px 0px 4px 4px;
    box-shadow: 0px 30px 48px -17px rgba(160, 165, 174, 0.3);
    box-sizing: border-box;
  }
`

const DropDownContent = styled('div')`
  display: flex;
  flex-direction: column;
  white-space: nowrap;
  word-break: keep-all;
  background: white;
`

const ZoomControlButton = styled(Button)`
  display: flex;
  justify-content: space-between;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  padding: 7px 8px;
  text-transform: none;
  color: #333333;
`

const ShortcutLabel = styled('span')`
  color: #cad3dd;
`

interface ZoomProps {
  zoom: number
  onZoom: (arg: number) => void
  onZoomIn: VoidFunction
  onZoomOut: VoidFunction
  disabledButtons: string[]
  shortcuts: { [key in string]: string }
}

export const ZoomControls = ({
  zoom,
  onZoom,
  onZoomIn,
  onZoomOut,
  disabledButtons,
  shortcuts
}: ZoomProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const anchorRef = useRef(null)

  const onZoomSubmit = useCallback(
    (input: number) => {
      onZoom(input)
    },
    [onZoom]
  )

  const onClose = () => {
    setIsExpanded(false)
  }

  const onExpand = () => {
    setIsExpanded(true)
  }

  const resetZoom = () => {
    onZoom(100)
  }

  return (
    <ElementAndDropdown ref={anchorRef}>
      <DropDownButton onClick={onExpand}>
        <ZoomLabel>{Math.round(zoom)}%</ZoomLabel>
        <Icon name="chevron" />
      </DropDownButton>

      <Dropdown
        open={isExpanded}
        onClose={onClose}
        anchorEl={anchorRef.current}
        container={anchorRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}>
        <DropDownContent>
          <ZoomInput currentZoom={zoom} onZoom={onZoomSubmit} />
          <ZoomControlButton
            title="Zoom Out"
            onClick={onZoomOut}
            disabled={disabledButtons.includes('zoom-out')}>
            <span>Zoom out</span>
            <ShortcutLabel>{shortcuts['zoom-out']}</ShortcutLabel>
          </ZoomControlButton>
          <ZoomControlButton
            title="Zoom In"
            onClick={onZoomIn}
            disabled={disabledButtons.includes('zoom-in')}>
            <span>Zoom in</span>
            <ShortcutLabel>{shortcuts['zoom-in']}</ShortcutLabel>
          </ZoomControlButton>
          <ZoomControlButton onClick={resetZoom}>
            <span>Zoom 100%</span>
          </ZoomControlButton>
        </DropDownContent>
      </Dropdown>
    </ElementAndDropdown>
  )
}
