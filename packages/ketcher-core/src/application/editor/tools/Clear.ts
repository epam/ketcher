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
import { BaseTool } from 'application/editor/tools/Tool';
import { ReinitializeModeOperation } from 'application/editor/operations/modes';
import { Operation } from 'domain/entities/Operation';
import { DrawingEntity } from 'domain/entities/DrawingEntity';

class ResetDrawingEntitiesModelOperation implements Operation {
  constructor(private readonly editor: CoreEditor) {}

  public execute() {
    // intentional no-op: executeAfterAllOperations must run after delete operations
    // remove entities from the current model
  }

  public invert() {
    // intentional no-op: invertAfterAllOperations must run after restore operations
    // return deleted entities to the current model
  }

  public executeAfterAllOperations() {
    this.editor.drawingEntitiesManager.resetState();
    DrawingEntity.resetIdCounter();
  }

  public invertAfterAllOperations() {
    DrawingEntity.syncIdCounter(
      this.editor.drawingEntitiesManager.allEntitiesArray,
    );
  }
}

class ClearTool implements BaseTool {
  constructor(private readonly editor: CoreEditor) {
    this.editor = editor;

    // Only update history if there are entities to delete
    if (!this.editor.drawingEntitiesManager.hasDrawingEntities) {
      return;
    }

    const history = EditorHistory.getInstance(editor);
    const mode = editor.mode;

    const modelChanges = this.editor.drawingEntitiesManager.deleteAllEntities();

    if (mode.modeName === 'sequence-layout-mode') {
      modelChanges.addOperation(new ReinitializeModeOperation());
    }

    modelChanges.addOperation(new ResetDrawingEntitiesModelOperation(editor));

    this.editor.transientDrawingView.clear();
    this.editor.renderersContainer.update(modelChanges);
    history.update(modelChanges);
  }

  destroy() {
    // intentional no-op: this tool holds no resources that require cleanup
  }
}

export { ClearTool };
