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

interface DocumentWithFullscreen extends Document {
  mozFullScreenElement?: Element
  msFullscreenElement?: Element
  webkitFullscreenElement?: Element
  msExitFullscreen?: () => void
  mozCancelFullScreen?: () => void
  webkitExitFullscreen?: () => void
}

interface ElementWithFullscreen extends HTMLElement {
  msRequestFullscreen?: () => void
  mozRequestFullScreen?: () => void
  webkitRequestFullscreen?: () => void
}

const requestFullscreen = (element: ElementWithFullscreen) => {
  if (element.requestFullscreen) {
    element.requestFullscreen()
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen()
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen()
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen()
  }
}

const exitFullscreen = (document: DocumentWithFullscreen) => {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen()
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen()
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen()
  }
}

const isFullScreen = (document: DocumentWithFullscreen) => {
  return !!(
    document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  )
}

const toggleFullscreen = () => {
  const fullscreenElement: ElementWithFullscreen =
    document.querySelector('.Ketcher-root') || document.documentElement
  const fullscreenDocument = document as DocumentWithFullscreen
  isFullScreen(fullscreenDocument)
    ? exitFullscreen(fullscreenDocument)
    : requestFullscreen(fullscreenElement)
}

export default {
  fullscreen: {
    title: 'Fullscreen mode',
    action: () => toggleFullscreen()
  }
}
