import { Tool, ToolConstructorInterface } from '../Tool';
import { Editor } from '../../Editor';
import { SelectViewOnlyTool } from './selectViewOnly';
import SelectTool from './select';
import { SelectMode } from './select.types';

export * from './select.helpers';

function createSelectTool(editor: Editor, mode: SelectMode): Tool {
  const isViewOnlyMode = editor.render.options.viewOnlyMode === true;
  return isViewOnlyMode
    ? new SelectViewOnlyTool(editor, mode)
    : new SelectTool(editor, mode);
}

// Cast to ToolConstructorInterface to maintain compatibility with toolsMap
// The function works correctly when called with 'new' as it returns a Tool instance
export const SelectCommonTool =
  createSelectTool as unknown as ToolConstructorInterface;
