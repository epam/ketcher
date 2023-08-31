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

export interface IRnaPreset {
  name?: string;
  base?: MonomerItemType;
  sugar?: MonomerItemType;
  phosphate?: MonomerItemType;
  presetInList?: IRnaPreset;
}

export interface Tool extends ToolEventHandler {
  cancel?(): void;

  isSelectionRunning?(): boolean;

  isNotActiveTool?: boolean;
}

// export type ToolOptions = MonomerItemType;
// !todo
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ToolOptions = any;

export type ToolConstructorInterface = {
  new (editor, ...args: ToolOptions[]): Tool;
};

export type ToolEventHandlerName = keyof ToolEventHandler;
