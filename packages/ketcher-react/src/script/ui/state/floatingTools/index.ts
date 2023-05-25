import { Reducer } from 'react'
import { Vec2 } from 'ketcher-core'

export interface FloatingToolsState {
  visible: boolean
  handlePos: Vec2
}
const initialState: FloatingToolsState = {
  visible: false,
  handlePos: new Vec2()
}

export type FloatingToolsPayload = Partial<FloatingToolsState>
export const updateFloatingTools = (payload: FloatingToolsPayload) => {
  return {
    type: 'UPDATE_FLOATING_TOOLS',
    payload
  }
}

interface FloatingToolsAction {
  type: 'UPDATE_FLOATING_TOOLS'
  payload: FloatingToolsState
}
const floatingToolsReducer: Reducer<
  FloatingToolsPayload,
  FloatingToolsAction
> = (state = initialState, { type, payload }) => {
  switch (type) {
    case 'UPDATE_FLOATING_TOOLS':
      return { ...state, ...payload }
    default:
      return state
  }
}

export default floatingToolsReducer
