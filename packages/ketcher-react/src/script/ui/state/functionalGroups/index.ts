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
import {
  FunctionalGroupsProvider,
  SdfItem,
  SdfSerializer,
  Struct
} from 'ketcher-core'
import { prefetchStatic } from '../templates/init-lib'

interface FGState {
  lib: []
  functionalGroupInfo: any
  mode: string
}

const initialState: FGState = {
  lib: [],
  functionalGroupInfo: null,
  mode: 'fg'
}

const functionalGroupsReducer = (
  state = initialState,
  { type, payload }: AnyAction
) => {
  switch (type) {
    case 'FG_INIT':
      return { ...state, ...payload }

    case 'FG_HIGHLIGHT':
      return { ...state, functionalGroupInfo: payload }

    default:
      return state
  }
}

const initFGroups = (lib: SdfItem[]) => ({ type: 'FG_INIT', payload: { lib } })
const highlightFGroup = (group: any) => ({
  type: 'FG_HIGHLIGHT',
  payload: group
})

export function highlightFG(dispatch, group: any) {
  dispatch(highlightFGroup(group))
}

export function initFGTemplates(baseUrl: string) {
  return async (dispatch) => {
    const fileName = 'fg.sdf'
    const url = `${baseUrl}/templates/${fileName}`
    const provider = FunctionalGroupsProvider.getInstance()
    const sdfSerializer = new SdfSerializer()
    const text = await prefetchStatic(url)
    const templates = sdfSerializer.deserialize(text)
    const functionalGroups = templates.reduce(
      (acc: Struct[], { struct }) => [...acc, struct],
      []
    )
    provider.setFunctionalGroupsList(functionalGroups)
    dispatch(initFGroups(templates))
    dispatch(appUpdate({ functionalGroups: true }))
  }
}

export default functionalGroupsReducer
