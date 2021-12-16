export function init(value) {
  return {
    type: 'INIT',
    payload: value
  }
}

export function initAsync(value) {
  return {
    type: 'INIT_ASYNC',
    payload: value
  }
}
