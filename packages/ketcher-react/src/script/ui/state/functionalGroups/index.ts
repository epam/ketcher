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

import { AnyAction } from 'redux'
import { appUpdate } from '../options'
import { functionalGroupsProvider, SdfItem } from 'ketcher-core'

interface FGState {
  lib: []
  mode: string
}

const initialState: FGState = {
  lib: [],
  mode: 'fg'
}

const functionalGroupsReducer = (
  state = initialState,
  { type, payload }: AnyAction
) => {
  switch (type) {
    case 'FG_INIT':
      return { ...state, ...payload }

    default:
      return state
  }
}

const initFGroups = (lib: SdfItem[]) => ({ type: 'FG_INIT', payload: { lib } })

export function initFGTemplates() {
  return async (dispatch) => {
    dispatch(initFGroups(functionalGroupsProvider.functionalGroups))
    dispatch(appUpdate({ functionalGroups: true }))
  }
}

export default functionalGroupsReducer
