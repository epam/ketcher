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

import { useState, useRef, CSSProperties, useCallback } from 'react'
import styled from '@emotion/styled'
import { Button, Popover as Dropdown } from '@mui/material'

import { ZoomInputField } from './ZoomInputField'
import Icon from 'src/script/ui/component/view/icon'

interface ZoomProps {
  zoom: number
  setZoom: (arg: number) => void
  onZoomIn: VoidFunction
  onZoomOut: VoidFunction
  disabledButtons: string[]
  shortcuts: { [key in string]: string }
}

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

const dropdownStyles: CSSProperties = {
  padding: '8px',
  width: '135px',
  border: 'none',
  borderRadius: '0px 0px 4px 4px',
  boxShadow:
    '0px 100px 80px rgba(160, 165, 174, 0.07), 0px 41.7776px 33.4221px rgba(160, 165, 174, 0.0503198), 0px 22.3363px 17.869px rgba(160, 165, 174, 0.0417275), 0px 12.5216px 10.0172px rgba(160, 165, 174, 0.035), 0px 6.6501px 5.32008px rgba(160, 165, 174, 0.0282725), 0px 2.76726px 2.21381px rgba(160, 165, 174, 0.0196802)',
  boxSizing: 'border-box'
}

export const ZoomControls = ({
  zoom,
  setZoom,
  onZoomIn,
  onZoomOut,
  disabledButtons,
  shortcuts
}: ZoomProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [isClosing, setClosing] = useState<boolean>(false)
  const buttonRef = useRef(null)

  const collapseHandler = useCallback(() => {
    setIsExpanded(false)
    setClosing(false)
  }, [setIsExpanded, setClosing])

  const onClose = () => {
    setClosing(true)
  }

  const onExpand = () => {
    setIsExpanded(true)
  }

  const resetZoom = () => {
    setZoom(1)
  }

  return (
    <ElementAndDropdown>
      <DropDownButton onClick={onExpand} ref={buttonRef}>
        <ZoomLabel>{zoom * 100}%</ZoomLabel>
        <Icon name="chevron" />
      </DropDownButton>

      <Dropdown
        open={isExpanded}
        onClose={onClose}
        anchorEl={buttonRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        PaperProps={{ style: dropdownStyles }}
      >
        <DropDownContent>
          <ZoomInputField
            zoom={zoom}
            setZoom={setZoom}
            isClosing={isClosing}
            collapseHandler={collapseHandler}
          />
          <ZoomControlButton
            title="Zoom Out"
            onClick={onZoomOut}
            disabled={disabledButtons.includes('zoom-out')}
          >
            <span>Zoom out</span>
            <ShortcutLabel>{shortcuts['zoom-out']}</ShortcutLabel>
          </ZoomControlButton>
          <ZoomControlButton
            title="Zoom In"
            onClick={onZoomIn}
            disabled={disabledButtons.includes('zoom-in')}
          >
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
