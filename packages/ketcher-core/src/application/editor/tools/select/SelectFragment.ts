import { SelectBase } from 'application/editor/tools/select/SelectBase';
import { CoreEditor } from 'application/editor';

export class SelectFragment extends SelectBase {
  constructor(readonly editor: CoreEditor) {
    super(editor);
  }

  protected createSelectionView() {}

  protected onSelectionMove() {}

  protected updateSelectionViewParams() {}
}