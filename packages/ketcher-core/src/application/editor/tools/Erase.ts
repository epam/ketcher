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
import { CoreEditor } from 'application/editor';
import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { BaseTool } from 'application/editor/tools/Tool';

class EraserTool implements BaseTool {
  constructor(private editor: CoreEditor) {
    this.editor = editor;
    if (this.editor.drawingEntitiesManager.selectedEntities.length) {
      const modelChanges =
        this.editor.drawingEntitiesManager.deleteSelectedEntities();
      this.editor.renderersContainer.update(modelChanges);
    }
  }

  mousedown(event) {
    const selectedItemRenderer = event.target.__data__;
    if (selectedItemRenderer instanceof BaseRenderer) {
      const modelChanges =
        this.editor.drawingEntitiesManager.deleteDrawingEntity(
          selectedItemRenderer.drawingEntity,
        );
      this.editor.renderersContainer.update(modelChanges);
    }
  }

  destroy() {}
}

export { EraserTool };
