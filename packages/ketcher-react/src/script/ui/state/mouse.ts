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

import { updateCursorPosition } from './common';
import { throttle } from 'lodash';

const MOUSE_MOVE_THROTTLE_TIMEOUT = 300;

const handleMouseMove = (dispatch, event: MouseEvent) => {
  dispatch(updateCursorPosition(event.clientX, event.clientY));
};

export function initMouseListener(element) {
  return function (dispatch) {
    const throttledHandleMouseMove = throttle(
      handleMouseMove,
      MOUSE_MOVE_THROTTLE_TIMEOUT
    );

    element.addEventListener('pointermove', (event: MouseEvent) =>
      throttledHandleMouseMove(dispatch, event)
    );
  };
}
