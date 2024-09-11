import { Tool } from '../Tool';
import Editor from '../../Editor';
import LassoHelper from '../helper/lasso';
import { SelectMode } from './select.types';
import {
  onSelectionEnd,
  onSelectionLeave,
  onSelectionMove,
  onSelectionStart,
} from './select.helpers';

export class SelectViewOnlyTool implements Tool {
  private readonly lassoHelper: LassoHelper;
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly editor: Editor, private mode: SelectMode) {
    this.lassoHelper = new LassoHelper(
      this.mode === 'lasso' ? 0 : 1,
      editor,
      this.mode === 'fragment',
    );
  }

  isSelectionRunning() {
    return this.lassoHelper.running();
  }

  mousedown(event: PointerEvent) {
    onSelectionStart(event, this.editor, this.lassoHelper);
  }

  mousemove(event: PointerEvent) {
    onSelectionMove(event, this.editor, this.lassoHelper);
  }

  mouseup(event: PointerEvent) {
    onSelectionEnd(event, this.editor, this.lassoHelper);
  }

  mouseleave() {
    onSelectionLeave(this.editor, this.lassoHelper);
  }
}
