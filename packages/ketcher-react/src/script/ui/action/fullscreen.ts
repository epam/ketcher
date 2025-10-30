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

import isHidden from './isHidden';

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

const getIfFullScreen = () => {
  return !!(
    document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  );
};

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

const toggleFullscreen = () => {
  const fullscreenElement = getFullscreenElement();
  getIfFullScreen() ? exitFullscreen() : requestFullscreen(fullscreenElement);
};

export default {
  fullscreen: {
    title: 'Fullscreen mode',
    enabledInViewOnly: true,
    action: () => toggleFullscreen(),
    hidden: (options) => isHidden(options, 'fullscreen'),
  },
};
