import type Editor from '../Editor';

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

export type HoverTarget =
  | { id: number; map: string }
  | { map: 'merge'; items: Record<string, number[]> };

export interface Tool extends ToolEventHandler {
  cancel?(): void;

  isSelectionRunning?(): boolean;

  isNotActiveTool?: boolean;

  ci?: HoverTarget;
}

// `never[]` rest params: constructor parameters are contravariant, so a
// `never`-typed rest accepts any concrete tool constructor in `toolsMap`.
// Do NOT change to `unknown[]` / `any[]` — it breaks the union.
export type ToolConstructorInterface = new (
  editor: Editor,
  ...args: never[]
) => Tool;

export type ToolEventHandlerName = keyof ToolEventHandler;
