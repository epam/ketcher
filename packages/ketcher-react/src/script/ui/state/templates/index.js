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

import initTmplLib, { initLib } from './init-lib'

import { KetSerializer } from 'ketcher-core'
import { omit } from 'lodash/fp'
import { openDialog } from '../modal'
import { storage } from '../../storage-ext'

export { initTmplLib }

/* TEMPLATES */
export function selectTmpl(tmpl) {
  return {
    type: 'TMPL_SELECT',
    data: { selected: tmpl }
  }
}

export function changeGroup(group) {
  return {
    type: 'TMPL_CHANGE_GROUP',
    data: { group, selected: null }
  }
}

export function changeFilter(filter) {
  return {
    type: 'TMPL_CHANGE_FILTER',
    data: { filter: filter.trim(), selected: null } // TODO: change this
  }
}

/* TEMPLATE-ATTACH-EDIT */
export function initAttach(name, attach) {
  return {
    type: 'INIT_ATTACH',
    data: {
      name,
      atomid: attach.atomid,
      bondid: attach.bondid
    }
  }
}

export function setAttachPoints(attach) {
  return {
    type: 'SET_ATTACH_POINTS',
    data: {
      atomid: attach.atomid,
      bondid: attach.bondid
    }
  }
}

export function setTmplName(name) {
  return {
    type: 'SET_TMPL_NAME',
    data: { name }
  }
}

export function editTmpl(tmpl) {
  return (dispatch, getState) => {
    openDialog(dispatch, 'attach', { tmpl })
      .then(
        (formData) => {
          tmpl.struct.name = formData ? formData.name.trim() : tmpl.struct.name
          tmpl.props = formData
            ? Object.assign({}, tmpl.props, formData.attach)
            : tmpl.props

          if (tmpl.props.group === 'User Templates')
            updateLocalStore(getState().templates.lib)
        },
        () => null
      )
      .then(() => openDialog(dispatch, 'templates').catch(() => null))
  }
}

export function deleteUserTmpl(tmpl) {
  return {
    type: 'TMPL_DELETE',
    data: {
      tmpl: tmpl
    }
  }
}

export function deleteTmpl(tmpl) {
  return (dispatch, getState) => {
    const lib = getState().templates.lib.filter((value) => value !== tmpl)
    dispatch(deleteUserTmpl(tmpl))
    updateLocalStore(lib)
  }
}

/* SAVE */
export function saveUserTmpl(struct) {
  // TODO: structStr can be not in mol format => structformat.toString ...
  const tmpl = { struct: struct.clone(), props: {} }

  return (dispatch, getState) => {
    openDialog(dispatch, 'attach', { tmpl })
      .then(({ name, attach }) => {
        tmpl.struct.name = name.trim()
        tmpl.props = { ...attach, group: 'User Templates' }

        const lib = getState().templates.lib.concat(tmpl)
        dispatch(initLib(lib))
        updateLocalStore(lib)
      })
      .catch(() => null)
  }
}

function updateLocalStore(lib) {
  const ketSerializer = new KetSerializer()
  const userLib = lib
    .filter((item) => item.props.group === 'User Templates')
    .map((item) => ({
      struct: ketSerializer.serialize(item.struct),
      props: Object.assign({}, omit(['group'], item.props))
    }))

  storage.setItem('ketcher-tmpls', userLib)
}

/* REDUCER */
export const initTmplsState = {
  lib: [],
  selected: null,
  filter: '',
  group: null,
  attach: {},
  mode: 'classic'
}

const tmplActions = [
  'TMPL_INIT',
  'TMPL_SELECT',
  'TMPL_CHANGE_GROUP',
  'TMPL_CHANGE_FILTER'
]

const attachActions = ['INIT_ATTACH', 'SET_ATTACH_POINTS', 'SET_TMPL_NAME']

function templatesReducer(state = initTmplsState, action) {
  if (tmplActions.includes(action.type))
    return Object.assign({}, state, action.data)

  if (attachActions.includes(action.type)) {
    const attach = Object.assign({}, state.attach, action.data)
    return { ...state, attach }
  }

  if (action.type === 'TMPL_DELETE') {
    const currentState = Object.assign({}, state)
    const lib = currentState.lib.filter((value) => value !== action.data.tmpl)
    return { ...currentState, lib: lib }
  }

  return state
}

export default templatesReducer
