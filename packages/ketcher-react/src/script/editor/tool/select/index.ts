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

// Cast to ToolConstructorInterface to maintain compatibility with toolsMap.
// This is safe because in JavaScript, when a function called with 'new' returns
// an object, that object becomes the result (rather than 'this'). Since
// createSelectTool always returns a Tool instance, it works correctly as a constructor.
export const SelectCommonTool =
  createSelectTool as unknown as ToolConstructorInterface;
