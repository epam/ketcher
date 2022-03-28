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

import styled from '@emotion/styled'

import { HelpLink } from './HelpLink'
import { IconButton } from './IconButton'

interface SystemControlsProps {
  disabledButtons: string[]
  hiddenButtons: string[]
  className?: string
  onSettingsOpen: () => void
  onHistoryClick: () => void
  onFullscreen: () => void
}

const getIfFullScreen = () => {
  return !!(
    document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  )
}

const ControlsPanel = styled('div')`
  display: flex;
  align-items: center;
  flex-grow: 1;
  justify-content: flex-end;
`

export const SystemControls = ({
  disabledButtons,
  hiddenButtons,
  onSettingsOpen,
  onHistoryClick,
  onFullscreen,
  className
}: SystemControlsProps) => {
  return (
    <ControlsPanel className={className}>
      <IconButton
        title="History"
        onClick={onHistoryClick}
        iconName="history"
        disabled={disabledButtons.includes('history')}
        isHidden={hiddenButtons.includes('history')}
      />
      <IconButton
        title="Settings"
        onClick={onSettingsOpen}
        iconName="settings"
        disabled={disabledButtons.includes('settings')}
        isHidden={hiddenButtons.includes('settings')}
      />
      <HelpLink isHidden={hiddenButtons.includes('help')} />
      <IconButton
        title="Fullscreen mode"
        onClick={onFullscreen}
        iconName={getIfFullScreen() ? 'fullscreen-exit' : 'fullscreen-enter'}
        disabled={disabledButtons.includes('fullscreen')}
        isHidden={hiddenButtons.includes('fullscreen')}
      />
    </ControlsPanel>
  )
}
