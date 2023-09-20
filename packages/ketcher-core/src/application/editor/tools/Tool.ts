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

  mouseOverPolymerBond?(event: Event): void;

  mouseLeavePolymerBond?(event: Event): void;

  mouseOverMonomer?(event: Event): void;

  mouseLeaveMonomer?(event: Event): void;

  mouseOverDrawingEntity?(event: Event): void;

  mouseLeaveDrawingEntity?(event: Event): void;

  mouseUpMonomer?(event: Event): void;
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

export interface BaseTool extends Tool {
  destroy(): void;
}

export type PeptideToolOptions = MonomerItemType;

// export type ToolOptions = MonomerItemType;
// !todo
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ToolOptions = any;
export type ToolConstructorInterface = {
  new (editor, ...args: ToolOptions[]): Tool | BaseTool;
};

export type ToolEventHandlerName = keyof ToolEventHandler;

export function isBaseTool(
  tool: Tool | BaseTool | undefined,
): tool is BaseTool {
  return (tool as BaseTool)?.destroy !== undefined;
}
