import { identifyStructFormat, FormatterFactory } from 'ketcher-core'

import { molfileManager } from '../../chem/molfile'
import smilesManager from '../../chem/smiles'
import graphManager from '../../format/chemGraph'

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

export function load(structStr, options) {
  return (dispatch, getState) => {
    const state = getState()
    const editor = state.editor
    const server = state.server

    options = options || {}
    const { rescale, fragment, ...formatterOptions } = options

    const format = identifyStructFormat(structStr)
    const factory = new FormatterFactory(
      server,
      graphManager,
      molfileManager,
      smilesManager
    )

    const service = factory.create(format, formatterOptions)
    return service.getStructureFromStringAsync(structStr).then(
      struct => {
        if (rescale) {
          struct.rescale() // TODO: move out parsing?
        }

        if (struct.isBlank()) {
          return
        }
        if (fragment) {
          dispatch(onAction({ tool: 'paste', opts: struct }))
        } else {
          editor.struct(struct)
        }
      },
      err => {
        //TODO: add error handler call
        //legacy message: Can't parse molecule!
      }
    )
  }
}
