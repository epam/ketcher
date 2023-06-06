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

import { Icon } from 'ketcher-react'
import { StyledMenuButton } from 'components/menu/menuItem'
import styled from '@emotion/styled'
import { useState } from 'react'

const requestFullscreen = (element: HTMLElement) => {
  ;(element.requestFullscreen && element.requestFullscreen()) ||
    (element.msRequestFullscreen && element.msRequestFullscreen()) ||
    (element.mozRequestFullScreen && element.mozRequestFullScreen()) ||
    (element.webkitRequestFullscreen && element.webkitRequestFullscreen())
}

const exitFullscreen = () => {
  ;(document.exitFullscreen && document.exitFullscreen()) ||
    (document.msExitFullscreen && document.msExitFullscreen()) ||
    (document.mozCancelFullScreen && document.mozCancelFullScreen()) ||
    (document.webkitExitFullscreen && document.webkitExitFullscreen())
}

const isFullScreen = () => {
  return !!(
    document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  )
}

const ButtonContainer = styled.div`
  position: absolute;
  right: 47px;
  bottom: 12px;
`

export const FullscreenButton = (props) => {
  const [fullScreenMode, setFullScreenMode] = useState(isFullScreen())
  const toggleFullscreen = () => {
    // TODO: add selector / ref prop when will be shared component
    const fullscreenElement: HTMLElement =
      document.querySelector('.Ketcher-polymer-editor-root') ||
      document.documentElement
    fullScreenMode ? exitFullscreen() : requestFullscreen(fullscreenElement)
    setFullScreenMode(!fullScreenMode)
  }
  return (
    <ButtonContainer className={props.className}>
      <StyledMenuButton onClick={toggleFullscreen} isActive={false}>
        <Icon name={fullScreenMode ? 'fullscreen-exit' : 'fullscreen-enter'} />
      </StyledMenuButton>
    </ButtonContainer>
  )
}
