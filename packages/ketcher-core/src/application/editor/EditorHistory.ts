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

import { Command } from 'domain/entities/Command';
import { CoreEditor } from './Editor';
import assert from 'assert';
const HISTORY_SIZE = 32; // put me to options

export type HistoryOperationType = 'undo' | 'redo';

export class EditorHistory {
  historyStack: Command[] | [] = [];
  historyPointer = 0;
  editor: CoreEditor | undefined;

  private static _instance;
  constructor(editor: CoreEditor) {
    if (EditorHistory._instance) {
      return EditorHistory._instance;
    }
    this.editor = editor;
    this.historyPointer = 0;

    EditorHistory._instance = this;

    return this;
  }

  update(command: Command) {
    this.historyStack.splice(this.historyPointer, HISTORY_SIZE + 1, command);
    if (this.historyStack.length > HISTORY_SIZE) {
      this.historyStack.shift();
    }
    this.historyPointer = this.historyStack.length;
    console.log(this);
  }

  undo() {
    if (this.historyPointer === 0) {
      return;
    }

    assert(this.editor);

    this.historyPointer--;
    const lastCommand = this.historyStack[this.historyPointer];
    lastCommand.invert(this.editor.renderersContainer);
    const turnOffSelectionCommand =
      this.editor?.drawingEntitiesManager.unselectAllDrawingEntities();
    this.editor?.renderersContainer.update(turnOffSelectionCommand);
  }

  redo() {
    if (this.historyPointer === this.historyStack.length) {
      return;
    }

    assert(this.editor);

    const lastCommand = this.historyStack[this.historyPointer];
    lastCommand.execute(this.editor.renderersContainer);
    this.historyPointer++;
  }

  destroy() {
    EditorHistory._instance = null;
  }
}
