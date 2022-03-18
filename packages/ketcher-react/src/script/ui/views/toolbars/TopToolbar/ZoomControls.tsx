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

import { IconButton } from './IconButton'
import { ZoomSlider } from './ZoomSlider'
import { ZoomList } from './ZoomList'
import styled from '@emotion/styled'

interface ZoomProps {
  zoom: number
  setZoom: (arg) => void
  onZoomIn: VoidFunction
  onZoomOut: VoidFunction
  disabledButtons: string[]
  shortcuts: { [key in string]: string }
}

const ControlsBox = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
`

export const ZoomControls = ({
  zoom,
  setZoom,
  onZoomIn,
  onZoomOut,
  disabledButtons,
  shortcuts
}: ZoomProps) => {
  return (
    <ControlsBox>
      <IconButton
        title="Zoom Out"
        onClick={onZoomOut}
        iconName="zoom-out"
        disabled={disabledButtons.includes('zoom-out')}
        shortcut={shortcuts['zoom-out']}
      />
      <ZoomSlider zoom={zoom} setZoom={setZoom} />
      <IconButton
        title="Zoom In"
        onClick={onZoomIn}
        iconName="zoom-in"
        disabled={disabledButtons.includes('zoom-in')}
        shortcut={shortcuts['zoom-out']}
      />
      <ZoomList zoom={zoom} setZoom={setZoom} />
    </ControlsBox>
  )
}
