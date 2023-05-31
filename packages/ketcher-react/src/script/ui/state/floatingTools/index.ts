import { Reducer } from 'react'

export interface FloatingToolsState {
  visible: boolean
  rotateHandlePosition: { x: number; y: number }
}
const initialState: FloatingToolsState = {
  visible: false,
  rotateHandlePosition: { x: 0, y: 0 }
}

export const showFloatingTools = (rotateHandlePosition: {
  x: number
  y: number
}) => {
  return {
    type: 'SHOW_FLOATING_TOOLS' as const,
    payload: {
      visible: true,
      rotateHandlePosition
    }
  }
}

export const hideFloatingTools = () => {
  return {
    type: 'HIDE_FLOATING_TOOLS' as const,
    payload: {
      visible: false
    }
  }
}

export const updateFloatingToolsPosition = (rotateHandlePosition: {
  x: number
  y: number
}) => {
  return {
    type: 'UPDATE_FLOATING_TOOLS_POSITION' as const,
    payload: {
      rotateHandlePosition
    }
  }
}

export interface FloatingToolsAction {
  type:
    | 'SHOW_FLOATING_TOOLS'
    | 'HIDE_FLOATING_TOOLS'
    | 'UPDATE_FLOATING_TOOLS_POSITION'
  payload: Partial<FloatingToolsState>
}

const floatingToolsReducer: Reducer<FloatingToolsState, FloatingToolsAction> = (
  state = initialState,
  { type, payload }
) => {
  switch (type) {
    case 'SHOW_FLOATING_TOOLS':
    case 'HIDE_FLOATING_TOOLS':
    case 'UPDATE_FLOATING_TOOLS_POSITION':
      return { ...state, ...payload }
    default:
      return state
  }
}

export default floatingToolsReducer
