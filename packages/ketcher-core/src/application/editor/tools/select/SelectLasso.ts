/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
import { SelectBase } from 'application/editor/tools/select/SelectBase';
import { CoreEditor } from 'application/editor';
import { SelectionLassoViewParams } from 'application/render/renderers/TransientView';
import { Vec2 } from 'domain/entities';

export class SelectLasso extends SelectBase {
  selectionViewParams: SelectionLassoViewParams = {
    type: 'lasso',
    path: [],
  };

  constructor(readonly editor: CoreEditor) {
    super(editor);
  }

  protected createSelectionView(): void {
    this.selectionViewParams.path = [];
    this.editor.transientDrawingView.showSelection(this.selectionViewParams);
  }

  protected updateSelectionViewParams(): void {
    this.selectionViewParams.path.push([
      this.editor.lastCursorPositionOfCanvas.x,
      this.editor.lastCursorPositionOfCanvas.y,
    ]);
  }

  protected onSelectionMove(isShiftPressed: boolean) {
    const editor = CoreEditor.provideEditorInstance();
    if (editor.isSequenceEditMode || editor.isSequenceEditInRNABuilderMode)
      return;

    requestAnimationFrame(() => {
      const path = this.selectionViewParams.path.map(
        (p) => new Vec2(p[0], p[1]),
      );
      const modelChanges =
        this.editor.drawingEntitiesManager.selectIfLocatedInPolygon(
          path,
          this.previousSelectedEntities,
          isShiftPressed,
        );
      this.editor.renderersContainer.update(modelChanges);

      this.editor.transientDrawingView.update();
    });

    requestAnimationFrame(() => {
      this.editor.transientDrawingView.update();
    });
  }
}
