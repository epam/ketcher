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

import {
  FormatterFactory,
  Pile,
  SGroup,
  getStereoAtomsMap,
  identifyStructFormat
} from 'ketcher-core'

import { supportedSGroupTypes } from './constants'
import { setAnalyzingFile } from './request'
import tools from '../action/tools'

export function onAction(action) {
  if (action && action.dialog) {
    return {
      type: 'MODAL_OPEN',
      data: { name: action.dialog }
    }
  }
  if (action && action.thunk) {
    return action.thunk
  }

  return {
    type: 'ACTION',
    action
  }
}

export function loadStruct(struct) {
  return (dispatch, getState) => {
    const editor = getState().editor
    editor.struct(struct)
  }
}

function parseStruct(struct, server, options) {
  if (typeof struct === 'string') {
    options = options || {}
    const { rescale, fragment, ...formatterOptions } = options

    const format = identifyStructFormat(struct)
    const factory = new FormatterFactory(server)

    const service = factory.create(format, formatterOptions)
    return service.getStructureFromStringAsync(struct)
  } else {
    return Promise.resolve(struct)
  }
}

export function load(struct, options) {
  return async (dispatch, getState) => {
    const state = getState()
    const editor = state.editor
    const server = state.server
    const errorHandler = editor.errorHandler

    options = options || {}

    dispatch(setAnalyzingFile(true))

    try {
      const parsedStruct = await parseStruct(struct, server, options)
      const { fragment } = options
      const hasUnsupportedGroups = parsedStruct.sgroups.some(
        (sGroup) => !supportedSGroupTypes[sGroup.type]
      )

      if (hasUnsupportedGroups) {
        await editor.event.confirm.dispatch()
        parsedStruct.sgroups = parsedStruct.sgroups.filter(
          (key, sGroup) => supportedSGroupTypes[sGroup.type]
        )
      }

      parsedStruct.rescale() // TODO: move out parsing?

      if (editor.struct().atoms.size) {
        // NB: reset id
        const oldStruct = editor.struct().clone()
        parsedStruct.sgroups.forEach((sg, sgId) => {
          const offset = SGroup.getOffset(oldStruct.sgroups.get(sgId))
          const atomSet = new Pile(sg.atoms)
          const crossBonds = SGroup.getCrossBonds(parsedStruct, atomSet)
          SGroup.bracketPos(sg, parsedStruct, crossBonds)
          if (offset) sg.updateOffset(offset)
        })
      }

      parsedStruct.findConnectedComponents()
      parsedStruct.setImplicitHydrogen()

      const stereAtomsMap = getStereoAtomsMap(
        parsedStruct,
        Array.from(parsedStruct.bonds.values())
      )

      parsedStruct.atoms.forEach((atom, id) => {
        if (parsedStruct.atomGetNeighbors(id).length === 0) {
          atom.stereoLabel = null
          atom.stereoParity = 0
        } else {
          const stereoProp = stereAtomsMap.get(id)
          if (stereoProp) {
            atom.stereoLabel = stereoProp.stereoLabel
            atom.stereoParity = stereoProp.stereoParity
          }
        }
      })

      parsedStruct.markFragments()

      if (fragment) {
        if (parsedStruct.isBlank()) {
          dispatch({
            type: 'ACTION',
            action: tools['select-lasso'].action
          })
        } else {
          dispatch(onAction({ tool: 'paste', opts: parsedStruct }))
        }
      } else {
        editor.struct(parsedStruct)
      }
      dispatch(setAnalyzingFile(false))
      dispatch({ type: 'MODAL_CLOSE' })
    } catch (err) {
      dispatch(setAnalyzingFile(false))
      err && errorHandler(err.message)
    }
  }
}
