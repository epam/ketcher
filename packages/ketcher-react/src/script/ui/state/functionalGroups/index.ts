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

import { initFGroupsTemplates } from '../templates'

const initialState = {
  lib: [],
  selected: null,
  filter: '',
  group: null,
  attach: {}
}

const functionalGroupsReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case 'FG_INIT':
    case 'SELECT_FG':
    case 'CHANGE_FG_GROUP':
    case 'CHANGE_FG_FILTER':
      return { ...state, ...payload }

    default:
      return state
  }
}

// export const funcGroupsInit = (lib) => ({ type: 'FG_INIT', payload: { lib } })

export const selectFuncGroup = selected => ({
  type: 'SELECT_FG',
  payload: { selected }
})

export const changeGroupList = group => ({
  type: 'CHANGE_FG_GROUP',
  payload: { group }
})

export const changeFilter = filter => ({
  type: 'CHANGE_FG_FILTER',
  payload: { filter }
})

export default functionalGroupsReducer
