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
import type { CoreEditor } from './Editor';
import { assert } from 'utilities';
import { ketcherProvider } from 'application/ketcherProvider';
import { EditorHistoryAction } from './EditorHistoryAction';
const HISTORY_SIZE = 32; // put me to options

export type HistoryOperationType = 'undo' | 'redo';

export class EditorHistory {
  private readonly commands: Command[] = [];
  private pointer = 0;
  editor!: CoreEditor;

  private static readonly instances = new WeakMap<CoreEditor, EditorHistory>();

  constructor(editor: CoreEditor) {
    this.editor = editor;
  }

  static getInstance(editor: CoreEditor): EditorHistory {
    let instance = EditorHistory.instances.get(editor);
    if (!instance) {
      instance = new EditorHistory(editor);
      EditorHistory.instances.set(editor, instance);
    }
    return instance;
  }

  private get moleculesEditor() {
    return ketcherProvider.getKetcher(this.editor.ketcherId)?.editor;
  }

  get historyStack() {
    return this.moleculesEditor?.historyStack ?? this.commands;
  }

  get historyPointer() {
    return this.moleculesEditor?.historyPtr ?? this.pointer;
  }

  update(command: Command, megreWithLatestHistoryCommand?: boolean) {
    const latestCommand = this.previousCommand;
    if (
      megreWithLatestHistoryCommand &&
      latestCommand &&
      this.historyPointer === this.historyStack.length
    ) {
      latestCommand.merge(command);
    } else if (this.moleculesEditor) {
      this.moleculesEditor.addHistoryAction(
        new EditorHistoryAction(
          () => this.performCommand(command, 'undo'),
          () => this.performCommand(command, 'redo'),
          command,
        ),
      );
    } else {
      this.commands.splice(this.pointer, HISTORY_SIZE + 1, command);
      if (this.commands.length > HISTORY_SIZE) {
        this.commands.shift();
      }
      this.pointer = this.commands.length;
    }
    if (!this.moleculesEditor || this.previousCommand !== command) {
      ketcherProvider.getKetcher(this.editor.ketcherId)?.changeEvent.dispatch();
    }
    // Fire a dedicated model-change signal only when something actually
    // changed, so a no-op command doesn't trigger needless macromolecule
    // properties recalculation.
    if (command.operations.length > 0) {
      this.editor.events.modelChange.dispatch();
    }
  }

  undo() {
    if (this.historyPointer === 0) {
      return;
    }
    if (this.moleculesEditor) {
      this.moleculesEditor.undo();
      return;
    }
    ketcherProvider.getKetcher(this.editor.ketcherId)?.changeEvent.dispatch();
    assert(this.editor);

    this.pointer--;
    this.performCommand(this.commands[this.pointer], 'undo');
  }

  redo() {
    if (this.historyPointer === this.historyStack.length) {
      return;
    }
    if (this.moleculesEditor) {
      this.moleculesEditor.redo();
      return;
    }
    ketcherProvider.getKetcher(this.editor.ketcherId)?.changeEvent.dispatch();
    assert(this.editor);

    const lastCommand = this.commands[this.pointer];
    this.performCommand(lastCommand, 'redo');
    this.pointer++;
  }

  private performCommand(command: Command, operation: HistoryOperationType) {
    if (operation === 'undo') {
      command.invert(this.editor.renderersContainer);
    } else {
      command.execute(this.editor.renderersContainer);
    }
    const turnOffSelectionCommand =
      this.editor?.drawingEntitiesManager.unselectAllDrawingEntities();
    this.editor?.renderersContainer.update(turnOffSelectionCommand);
    // Dispatch after the model has been re-applied so subscribers observe the
    // up-to-date structure.
    this.editor.events.modelChange.dispatch();
  }

  public get previousCommand() {
    const entry = this.historyStack[this.historyPointer - 1];
    return entry instanceof EditorHistoryAction
      ? entry.command
      : entry instanceof Command
        ? entry
        : undefined;
  }

  destroy() {
    EditorHistory.instances.delete(this.editor);
  }
}
