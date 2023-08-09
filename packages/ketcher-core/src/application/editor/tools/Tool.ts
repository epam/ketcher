import { MonomerItemType } from 'domain/types';

interface ToolEventHandler {
  click?(event: Event): void;

  dblclick?(event: Event): void;

  mousedown?(event: Event): void;

  mousemove?(event: Event): void;

  mouseup?(event: Event): void;

  mouseleave?(event: Event): void;

  mouseLeaveClientArea?(event: Event): void;

  mouseover?(event: Event): void;
}

export interface Tool extends ToolEventHandler {
  cancel?(): void;

  isSelectionRunning?(): boolean;

  isNotActiveTool?: boolean;
}

export type PeptideToolOptions = MonomerItemType;

export type ToolOptions = PeptideToolOptions;

export type ToolConstructorInterface = {
  new (editor, ...args: ToolOptions[]): Tool;
};

export type ToolEventHandlerName = keyof ToolEventHandler;
