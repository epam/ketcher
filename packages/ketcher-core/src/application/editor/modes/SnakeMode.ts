import { Command } from 'domain/entities/Command';
import { CoreEditor } from '../Editor';
import { SelectSnakeModeOperation } from '../operations/polymerBond';

export class SnakeMode {
  static #enabled = false;

  static get isEnabled() {
    return this.#enabled;
  }

  static setSnakeMode(isSnakeModeEnabled: boolean) {
    const command = new Command();
    command.addOperation(new SelectSnakeModeOperation(isSnakeModeEnabled));

    const editor = CoreEditor.provideEditorInstance();
    editor.events.snakeModeChange.dispatch(isSnakeModeEnabled);

    this.#enabled = isSnakeModeEnabled;
    return command;
  }
}
