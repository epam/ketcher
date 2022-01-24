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
  return (dispatch, getState) => {
    const state = getState()
    const editor = state.editor
    const server = state.server
    const errorHandler = editor.errorHandler

    options = options || {}

    dispatch(setAnalyzingFile(true))

    return parseStruct(struct, server, options)
      .then(
        (struct) => {
          const { fragment } = options

          if (
            !struct.sgroups.some((sGroup) => !supportedSGroupTypes[sGroup.type])
          )
            return editor.event.confirm.dispatch().then(() => {
              struct.sgroups = struct.sgroups.filter(
                (key, sGroup) => supportedSGroupTypes[sGroup.type]
              )
              struct.rescale() // TODO: move out parsing?

              if (editor.struct().atoms.size) {
                // NB: reset id
                const oldStruct = editor.struct().clone()

                struct.sgroups.forEach((sg, sgId) => {
                  const offset = SGroup.getOffset(oldStruct.sgroups.get(sgId))
                  const atomSet = new Pile(sg.atoms)
                  const crossBonds = SGroup.getCrossBonds(struct, atomSet)
                  SGroup.bracketPos(sg, struct, crossBonds)
                  if (offset) sg.updateOffset(offset)
                })
              }

              struct.findConnectedComponents()
              struct.setImplicitHydrogen()

              const stereAtomsMap = getStereoAtomsMap(
                struct,
                Array.from(struct.bonds.values())
              )

              struct.atoms.forEach((atom, id) => {
                if (struct.atomGetNeighbors(id).length === 0) {
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

              struct.markFragments()

              if (fragment) {
                if (struct.isBlank()) {
                  dispatch({
                    type: 'ACTION',
                    action: tools['select-lasso'].action
                  })
                } else {
                  dispatch(onAction({ tool: 'paste', opts: struct }))
                }
              } else {
                editor.struct(struct)
              }
              dispatch(setAnalyzingFile(false))
              dispatch({ type: 'MODAL_CLOSE' })
            })
          // const isConfirmed = window.confirm(
          //   `Unsupported S-group type found. Would you like to import structure without it?`
          // )

          // if (!isConfirmed) {
          //   return
          // }
        },
        (err) => {
          dispatch(setAnalyzingFile(false))
          errorHandler(err.message)
        }
      )
      .catch((err) => {
        dispatch(setAnalyzingFile(false))
        errorHandler(err.message)
      })
  }
}
