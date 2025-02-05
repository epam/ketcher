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
import { CoreEditor, EditorHistory } from 'application/editor/internal';
import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { BaseTool } from 'application/editor/tools/Tool';
import { BaseSequenceRenderer } from 'application/render/renderers/sequence/BaseSequenceRenderer';
import { SequenceMode } from '../modes';

class EraserTool implements BaseTool {
  private history: EditorHistory;
  constructor(private editor: CoreEditor) {
    this.editor = editor;
    this.history = new EditorHistory(editor);
    if (
      this.editor.drawingEntitiesManager.selectedEntities.length &&
      !(this.editor.mode instanceof SequenceMode)
    ) {
      const modelChanges =
        this.editor.drawingEntitiesManager.deleteSelectedEntities();
      modelChanges.merge(
        this.editor.drawingEntitiesManager.recalculateAntisenseChains(),
      );
      this.history.update(modelChanges);
      this.editor.renderersContainer.update(modelChanges);
    }
  }

  mousedown(event) {
    const selectedItemRenderer = event.target.__data__;

    if (selectedItemRenderer instanceof BaseSequenceRenderer) {
      return;
    }

    if (selectedItemRenderer instanceof BaseRenderer) {
      const modelChanges =
        this.editor.drawingEntitiesManager.deleteDrawingEntity(
          selectedItemRenderer.drawingEntity,
        );
      modelChanges.merge(
        this.editor.drawingEntitiesManager.recalculateAntisenseChains(),
      );
      this.history.update(modelChanges);
      this.editor.renderersContainer.update(modelChanges);
    }
  }

  // TODO move hover logic somewhere to apply it for all or several tools from one place.
  //  Currently it is duplicated from select-rectangle tool
  mouseOverDrawingEntity(event) {
    const renderer = event.target.__data__;
    const modelChanges =
      this.editor.drawingEntitiesManager.intendToSelectDrawingEntity(
        renderer.drawingEntity,
      );
    this.editor.renderersContainer.update(modelChanges);
  }

  mouseLeaveDrawingEntity(event) {
    const renderer: BaseRenderer = event.target.__data__;

    const modelChanges =
      this.editor.drawingEntitiesManager.cancelIntentionToSelectDrawingEntity(
        renderer.drawingEntity,
      );
    this.editor.renderersContainer.update(modelChanges);
  }

  destroy() {}
}

export { EraserTool };
