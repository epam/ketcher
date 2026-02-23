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

import { CoreEditor } from 'application/editor/Editor';
import type { EditorHistory } from 'application/editor/EditorHistory';
import { BaseTool } from 'application/editor/tools/Tool';
import { ReinitializeModeOperation } from 'application/editor/operations/modes';

const createEditorHistory = (editor: CoreEditor): EditorHistory => {
  const { EditorHistory } = require('application/editor/EditorHistory');
  return new EditorHistory(editor);
};

class ClearTool implements BaseTool {
  private readonly history: EditorHistory | undefined;

  constructor(private readonly editor: CoreEditor) {
    this.editor = editor;

    // Only update history if there are entities to delete
    if (!this.editor.drawingEntitiesManager.hasDrawingEntities) {
      return;
    }

    this.history = createEditorHistory(editor);
    const mode = editor.mode;

    const modelChanges = this.editor.drawingEntitiesManager.deleteAllEntities();

    if (mode.modeName === 'sequence-layout-mode') {
      modelChanges.addOperation(new ReinitializeModeOperation());
    }

    this.editor.transientDrawingView.clear();
    this.editor.renderersContainer.update(modelChanges);
    this.history.update(modelChanges);
  }

  destroy() {}
}

export { ClearTool };
