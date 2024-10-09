import { Tool } from '../Tool';
import { Editor } from '../../Editor';
import { SelectViewOnlyTool } from './selectViewOnly';
import SelectTool from './select';
import { SelectMode } from './select.types';

export * from './select.helpers';

export class SelectCommonTool implements Tool {
  constructor(editor: Editor, mode: SelectMode) {
    const isViewOnlyMode = editor.render.options.viewOnlyMode === true;
    return isViewOnlyMode
      ? new SelectViewOnlyTool(editor, mode)
      : new SelectTool(editor, mode);
  }
}
