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

import { Coordinates, CoreEditor } from 'application/editor/internal';
import { SelectBase } from 'application/editor/tools/select/SelectBase';
import { Vec2 } from 'domain/entities';
import { SelectionRectangleViewParams } from 'application/render/renderers/TransientView';

class SelectRectangle extends SelectBase {
  selectionViewParams: SelectionRectangleViewParams = {
    type: 'rectangle',
    start: [0, 0],
    width: 0,
    height: 0,
  };

  constructor(readonly editor: CoreEditor) {
    super(editor);
  }

  protected updateSelectionViewParams() {
    const newWidth =
      this.editor.lastCursorPositionOfCanvas.x - this.mousePositionBeforeMove.x;
    const newHeight =
      this.editor.lastCursorPositionOfCanvas.y - this.mousePositionBeforeMove.y;
    this.selectionViewParams.start[0] =
      newWidth < 0
        ? this.editor.lastCursorPositionOfCanvas.x
        : this.mousePositionBeforeMove.x;
    this.selectionViewParams.start[1] =
      newHeight < 0
        ? this.editor.lastCursorPositionOfCanvas.y
        : this.mousePositionBeforeMove.y;
    this.selectionViewParams.width = Math.abs(newWidth);
    this.selectionViewParams.height = Math.abs(newHeight);
  }

  protected createSelectionView() {
    this.editor.transientDrawingView.showSelection(this.selectionViewParams);
  }

  protected onSelectionMove(isShiftPressed: boolean) {
    const editor = CoreEditor.provideEditorInstance();
    if (editor.isSequenceEditMode || editor.isSequenceEditInRNABuilderMode)
      return;
    requestAnimationFrame(() => {
      const topLeftX = Math.min(
        this.mousePositionBeforeMove.x,
        this.editor.lastCursorPosition.x,
      );
      const topLeftY = Math.min(
        this.mousePositionBeforeMove.y,
        this.editor.lastCursorPosition.y,
      );
      const bottomRightX = Math.max(
        this.mousePositionBeforeMove.x,
        this.editor.lastCursorPosition.x,
      );
      const bottomRightY = Math.max(
        this.mousePositionBeforeMove.y,
        this.editor.lastCursorPosition.y,
      );
      const topLeftPoint = Coordinates.viewToCanvas(
        new Vec2(topLeftX, topLeftY),
      );
      const bottomRightPoint = Coordinates.viewToCanvas(
        new Vec2(bottomRightX, bottomRightY),
      );

      const modelChanges =
        this.editor.drawingEntitiesManager.selectIfLocatedInRectangle(
          topLeftPoint,
          bottomRightPoint,
          this.previousSelectedEntities,
          isShiftPressed,
        );
      this.editor.renderersContainer.update(modelChanges);

      this.editor.transientDrawingView.update();
    });
  }
}

export { SelectRectangle };
