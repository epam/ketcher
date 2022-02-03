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

import { MolSerializer } from 'ketcher-core'
import { omit } from 'lodash/fp'
import { openDialog } from '../modal'

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
  return async (dispatch, getState) => {
    try {
      const formData = await openDialog(dispatch, 'attach', { tmpl })
      if (tmpl.props.group === 'User Templates') {
        await updateStorage(getState().templates.lib)
      }
      tmpl.struct.name = formData ? formData.name.trim() : tmpl.struct.name
      tmpl.props = formData
        ? Object.assign({}, tmpl.props, formData.attach)
        : tmpl.props
      await openDialog(dispatch, 'templates')
    } catch {}
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
    updateStorage(lib)
      .then(() => dispatch(deleteUserTmpl(tmpl)))
      .catch(() => null)
  }
}

/* SAVE */
export function saveUserTmpl(struct) {
  // TODO: structStr can be not in mol format => structformat.toString ...
  const tmpl = { struct: struct.clone(), props: {} }

  return async (dispatch, getState) => {
    try {
      const { name, attach } = await openDialog(dispatch, 'attach', { tmpl })

      tmpl.struct.name = name.trim()
      tmpl.props = { ...attach, group: 'User Templates' }
      const lib = getState().templates.lib.concat(tmpl)
      await updateStorage(lib)
      dispatch(initLib(lib))
    } catch {}
  }
}

function updateStorage(lib) {
  const molSerializer = new MolSerializer()
  const { storage } = window.ketcher
  const userLib = lib
    .filter((item) => item.props.group === 'User Templates')
    .map((item) => ({
      struct: molSerializer.serialize(item.struct),
      props: Object.assign({}, omit(['group'], item.props))
    }))
  return storage.set(userLib, 'ketcher-tmpls')
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
