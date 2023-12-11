import { Command } from 'domain/entities/Command';
import { SelectSnakeModeOperation } from '../operations/polymerBond';
import { CoreEditor } from '../Editor';

export class SnakeMode {
  static #enabled = false;

  static get isEnabled() {
    return this.#enabled;
  }

  private static changeSnakeMode(editor: CoreEditor, isSnakeModeEnabled) {
    editor.events.snakeModeChange.dispatch(isSnakeModeEnabled);
    this.#enabled = isSnakeModeEnabled;
  }

  static setSnakeMode(editor: CoreEditor, isSnakeModeEnabled: boolean) {
    const command = new Command();

    command.addOperation(
      new SelectSnakeModeOperation(
        this.changeSnakeMode.bind(this, editor, isSnakeModeEnabled),
        this.changeSnakeMode.bind(this, editor, !isSnakeModeEnabled),
      ),
    );

    return command;
  }
}
