import * as structFormat from '../data/convert/structformat'

export function onAction(action) {
  if (action && action.dialog) {
    return {
      type: 'MODAL_OPEN',
      data: { name: action.dialog }
    }
  }
  if (action && action.thunk) return action.thunk

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
    // TODO: check if structStr is parsed already
    // utils.loading('show');
    const parsed = structFormat.fromString(structStr, options, server)

    return parsed.then(
      struct => {
        // utils.loading('hide');
        console.assert(struct, 'No molecule to update')
        if (options.rescale) struct.rescale() // TODO: move out parsing?

        if (struct.isBlank()) return
        if (options.fragment)
          dispatch(onAction({ tool: 'paste', opts: struct }))
        else editor.struct(struct)
      },
      err => {
        //TODO: add error handler call
        //legacy message: Can't parse molecule!
      }
    )
  }
}
