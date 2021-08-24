import {
  FormatterFactory,
  Pile,
  SGroup,
  identifyStructFormat
} from 'ketcher-core'

import { getStereoAtomsMap } from '../../editor/actions/bond'

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

    options = options || {}

    return parseStruct(struct, server, options)
      .then(
        struct => {
          const { rescale, fragment } = options
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
        },
        err => {
          //TODO: add error handler call
          alert(err)
        }
      )
      .catch(alert)
  }
}
