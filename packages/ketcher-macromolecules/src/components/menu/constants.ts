export const SELECT_SUBMENU_ID = 'select-submenu';

export const MACRO_SELECTION_TOOL_OPTIONS = {
  'select-rectangle': 'rectangle',
  'select-lasso': 'lasso',
  'select-structure': 'structure',
} as const;

export type MacroSelectionTool = keyof typeof MACRO_SELECTION_TOOL_OPTIONS;

export const isMacroSelectionTool = (
  toolName: string | null,
): toolName is MacroSelectionTool =>
  toolName !== null &&
  Object.prototype.hasOwnProperty.call(MACRO_SELECTION_TOOL_OPTIONS, toolName);
