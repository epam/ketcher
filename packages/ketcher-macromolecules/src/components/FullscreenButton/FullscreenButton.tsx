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

import {
  KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
  IconButton,
} from 'ketcher-react';
import styled from '@emotion/styled';
import { useState } from 'react';

const requestFullscreen = (element: HTMLElement) => {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  }
};

const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
};

const isFullScreen = () => {
  return !!(
    document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  );
};

const ButtonContainer = styled.div`
  display: flex;

  & svg:first-of-type {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 24px;
    height: 24px;
    padding: 2px;
    border-radius: 4px;
  }
`;

export const FullscreenButton = (props) => {
  const [fullScreenMode, setFullScreenMode] = useState(isFullScreen());
  const toggleFullscreen = () => {
    // TODO: add selector / ref prop when will be shared component
    const fullscreenElement: HTMLElement =
      document.querySelector(KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR) ||
      document.documentElement;
    fullScreenMode ? exitFullscreen() : requestFullscreen(fullscreenElement);
    setFullScreenMode(!fullScreenMode);
  };
  return (
    <ButtonContainer className={props.className}>
      <IconButton
        onClick={toggleFullscreen}
        iconName={fullScreenMode ? 'fullscreen-exit' : 'fullscreen-enter'}
        testId="fullscreen-mode-button"
      />
    </ButtonContainer>
  );
};
