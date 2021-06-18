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

    return parseStruct(struct, server, options).then(
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
            sg.updateOffset(offset)
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
