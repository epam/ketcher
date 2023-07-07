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

import { CommonState } from './common.types';

const initialState: CommonState = {
  cursorPosition: {
    x: 0,
    y: 0,
  },
};

const COMMON_ACTIONS = {
  COMMON_UPDATE_CURSOR_POSITION: 'COMMON_UPDATE_CURSOR_POSITION',
} as const;

export const updateCursorPosition = (x: number, y: number) => ({
  type: COMMON_ACTIONS.COMMON_UPDATE_CURSOR_POSITION,
  data: {
    x,
    y,
  },
});

type CommonAction = ReturnType<typeof updateCursorPosition>;

function commonReducer(
  state: CommonState = initialState,
  action: CommonAction
): CommonState {
  switch (action.type) {
    case COMMON_ACTIONS.COMMON_UPDATE_CURSOR_POSITION: {
      return {
        ...state,
        cursorPosition: {
          x: action.data.x,
          y: action.data.y,
        },
      };
    }

    default:
      return state;
  }
}

export default commonReducer;
