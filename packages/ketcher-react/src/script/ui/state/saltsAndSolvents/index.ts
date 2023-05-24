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
  SaltsAndSolventsProvider,
  FunctionalGroupsProvider,
  SdfItem,
  SdfSerializer,
  Struct
} from 'ketcher-core'
import templatesRawData from '../../../../templates/salts-and-solvents.sdf'
import { MODES } from 'src/constants'

interface SaltsAndSolventsState {
  lib: []
  mode: string
}

const initialState: SaltsAndSolventsState = {
  lib: [],
  mode: MODES.FG
}

const saltsAndSolventsReducer = (
  state = initialState,
  { type, payload }: AnyAction
) => {
  switch (type) {
    case 'SALTS_AND_SOLVENTS_INIT':
      return { ...state, ...payload }

    default:
      return state
  }
}

const initSaltsAndSolvents = (lib: SdfItem[]) => ({
  type: 'SALTS_AND_SOLVENTS_INIT',
  payload: { lib }
})

export function initSaltsAndSolventsTemplates() {
  return async (dispatch) => {
    const saltsAndSolventsProvider = SaltsAndSolventsProvider.getInstance()
    const functionalGroupsProvider = FunctionalGroupsProvider.getInstance()
    const sdfSerializer = new SdfSerializer()
    const templates = sdfSerializer.deserialize(templatesRawData)
    const saltsAndSolvents = templates.reduce(
      (acc: Struct[], { struct, props }) => {
        struct.abbreviation = String(props.abbreviation)
        acc.push(struct)
        return acc
      },
      []
    )
    saltsAndSolventsProvider.setSaltsAndSolventsList(saltsAndSolvents)
    functionalGroupsProvider.addToFunctionalGroupsList(saltsAndSolvents)
    dispatch(initSaltsAndSolvents(templates))
    dispatch(appUpdate({ saltsAndSolvents: true }))
  }
}

export default saltsAndSolventsReducer
