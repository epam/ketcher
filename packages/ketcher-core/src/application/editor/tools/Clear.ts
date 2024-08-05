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
import { isSequenceMode } from 'application/editor/modes';
import { BaseTool } from 'application/editor/tools/Tool';
import { ReinitializeModeOperation } from 'application/editor/operations/modes';

class ClearTool implements BaseTool {
  private history: EditorHistory;

  constructor(private editor: CoreEditor) {
    this.editor = editor;
    this.history = new EditorHistory(editor);
    const mode = editor.mode;
    const isCurrentModeSequence = isSequenceMode(mode);
    const isSequenceEditMode = isCurrentModeSequence && mode.isEditMode;

    const modelChanges = this.editor.drawingEntitiesManager.deleteAllEntities();
    this.editor.renderersContainer.update(modelChanges);

    if (isCurrentModeSequence) {
      modelChanges.addOperation(new ReinitializeModeOperation());
    }

    this.history.update(modelChanges);

    if (isSequenceEditMode) {
      mode.startNewSequence();
    }
  }

  destroy() {}
}

export { ClearTool };
