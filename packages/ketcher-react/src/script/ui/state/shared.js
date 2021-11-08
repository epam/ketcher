import {
  FormatterFactory,
  Pile,
  SGroup,
  identifyStructFormat,
  NeedToResize
} from 'ketcher-core'

import { getStereoAtomsMap } from '../../editor/actions/bond'
import { supportedSGroupTypes } from './constants'

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
    const { fragment, ...formatterOptions } = options

    const format = identifyStructFormat(struct)

    const factory = new FormatterFactory(server)
    const service = factory.create(format, formatterOptions)
    const resultStruct = service.getStructureFromStringAsync(struct)
    return Promise.resolve(resultStruct).then(res => {
      return { struct: res, format: format }
    })
  } else {
    return Promise.resolve({ struct: struct, format: null })
  }
}

export function load(struct, options) {
  return (dispatch, getState) => {
    const state = getState()
    const editor = state.editor
    const server = state.server

    options = options || {}

    return parseStruct(struct, server, options).then(
      resolve => {
        const { fragment } = options
        const { struct, format } = resolve
        const rescale = format && NeedToResize[format]

        if (struct.sgroups.some(sGroup => !supportedSGroupTypes[sGroup.type])) {
          const isConfirmed = window.confirm(
            `Unsupported S-group type found. Would you like to import structure without it?`
          )

          if (!isConfirmed) {
            return
          }

          struct.sgroups = struct.sgroups.filter(
            (key, sGroup) => supportedSGroupTypes[sGroup.type]
          )
        }

        if (rescale) {
          struct.rescale() // TODO: move out parsing?

          //NB: reset id
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

        if (struct.isBlank()) {
          return
        }
        if (fragment) {
          dispatch(onAction({ tool: 'paste', opts: struct }))
        } else {
          editor.struct(struct)
        }

        dispatch({ type: 'MODAL_CLOSE' })
      },
      err => {
        //TODO: add error handler call
        alert(err)
      }
    )
  }
}
