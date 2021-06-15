import {
  FormatterFactory,
  identifyStructFormat,
  Pile,
  SGroup
} from 'ketcher-core'

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
    const factory = new FormatterFactory(server)

    const service = factory.create(format, formatterOptions)
    return service.getStructureFromStringAsync(structStr).then(
      struct => {
        if (rescale) {
          struct.rescale() // TODO: move out parsing?

          //NB: reset id
          const oldStruct = editor.struct().clone()

          struct.sgroups.forEach((sg, sgId) => {
            const offset = oldStruct.sgroups.get(sgId).getOffsetPP()
            const atomSet = new Pile(sg.atoms)
            const crossBonds = SGroup.getCrossBonds(struct, atomSet)
            SGroup.bracketPos(sg, struct, crossBonds)
            sg.setPPFromOffset(offset)
          })
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
        alert(err)
      }
    )
  }
}
