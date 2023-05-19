import Editor from '../Editor'

interface ToolEventHandler {
  click?(event: Event): void

  dblclick?(event: Event): void

  mousedown?(event: Event): void

  mousemove?(event: Event): void

  mouseup?(event: Event): void

  mouseleave?(event: Event): void

  mouseLeaveClientArea?(event: Event): void

  mouseover?(event: Event): void
}

export interface AbstractTool extends ToolEventHandler {
  close?(): void

  cancel?(): void

  isSelectionRunning?(): boolean

  isNotActiveTool?: boolean
}

export type ToolConstructorInterface = {
  new (editor: Editor, ...args: any[]): AbstractTool
}

export type ToolEventHandlerName = keyof ToolEventHandler
