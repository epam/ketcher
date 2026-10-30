import type { UiActionAction } from '../../action/action.types';

export type ActiveTool = UiActionAction | null | undefined;

export interface VisibleTools {
  [menuName: string]: string;
}

export interface ToolbarState {
  freqAtoms: string[];
  currentAtom: number;
  opened: string | null | undefined;
  visibleTools: VisibleTools;
}

export type ToolbarActionAction = {
  type: 'ACTION';
  action: ActiveTool;
};

export type AddAtomsAction = {
  type: 'ADD_ATOMS';
  data: string;
};

export type ClearVisibleAction = {
  type: 'CLEAR_VISIBLE';
  data: ActiveTool;
};

export type OpenedAction = {
  type: 'OPENED';
  data: {
    menuName: string | null | undefined;
    isSelected: boolean | null;
  };
};

export type ToolbarAction =
  | ToolbarActionAction
  | AddAtomsAction
  | ClearVisibleAction
  | OpenedAction
  | { type: 'UPDATE' }
  | { type: 'MODAL_OPEN' };

export interface ToolbarResizeState {
  editor?: {
    render: {
      update: () => void;
    };
  } | null;
  actionState?: {
    activeTool: ActiveTool;
  } | null;
}
