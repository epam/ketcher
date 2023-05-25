import type { FloatingToolsState } from '..'

export const getFloatingToolsVisible = (state) => {
  const floatingTools: FloatingToolsState = state.floatingTools
  return floatingTools.visible
}

export const getFloatingToolsHandlePos = (state) => {
  const floatingTools: FloatingToolsState = state.floatingTools
  return floatingTools.handlePos
}
