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

import { IconButton } from 'ketcher-react';
import styled from '@emotion/styled';
import { useState } from 'react';

const requestFullscreen = (element: HTMLElement) => {
  (element.requestFullscreen && element.requestFullscreen()) ||
    (element.msRequestFullscreen && element.msRequestFullscreen()) ||
    (element.mozRequestFullScreen && element.mozRequestFullScreen()) ||
    (element.webkitRequestFullscreen && element.webkitRequestFullscreen());
};

const exitFullscreen = () => {
  (document.exitFullscreen && document.exitFullscreen()) ||
    (document.msExitFullscreen && document.msExitFullscreen()) ||
    (document.mozCancelFullScreen && document.mozCancelFullScreen()) ||
    (document.webkitExitFullscreen && document.webkitExitFullscreen());
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

const getFullscreenElement = (): HTMLElement => {
  const ketcherRoot = document.querySelector(
    '.Ketcher-root, .Ketcher-polymer-editor-root',
  ) as HTMLElement;

  if (ketcherRoot) {
    const markedContainer = ketcherRoot.closest(
      '[data-ketcher-fullscreen-container]',
    );
    if (markedContainer) {
      return markedContainer as HTMLElement;
    }

    const editorRoot = ketcherRoot.closest('[data-ketcher-editor]');
    if (editorRoot) {
      const editorParent = editorRoot.parentElement;

      if (
        editorParent &&
        editorParent !== document.body &&
        editorParent !== document.documentElement
      ) {
        if (editorParent.id === 'root') {
          return editorParent;
        }
        return editorParent;
      }

      const rootElement = editorRoot.closest('#root');
      if (rootElement) {
        return rootElement as HTMLElement;
      }
    }

    const rootById = document.getElementById('root');
    if (rootById) {
      return rootById;
    }
  }

  return document.getElementById('root') || document.documentElement;
};

export const FullscreenButton = (props) => {
  const [fullScreenMode, setFullScreenMode] = useState(isFullScreen());
  const toggleFullscreen = () => {
    const fullscreenElement = getFullscreenElement();
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
