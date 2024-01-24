import { Command } from 'domain/entities/Command';
import { SelectLayoutModeOperation } from '../operations/polymerBond';
import { CoreEditor } from '../Editor';
import { LayoutMode, modesMap } from 'application/editor';

export abstract class BaseMode {
  protected constructor(
    public modeName: LayoutMode,
    private previousMode: LayoutMode = 'flex-layout-mode',
  ) {}

  private changeMode(editor: CoreEditor, modeName: LayoutMode) {
    editor.events.layoutModeChange.dispatch(modeName);
    const ModeConstructor = modesMap[modeName];
    editor.setMode(new ModeConstructor());
    editor.mode.initialize();
  }

  public initialize() {
    const command = new Command();
    const editor = CoreEditor.provideEditorInstance();

    command.addOperation(
      new SelectLayoutModeOperation(
        this.changeMode.bind(this, editor, this.modeName),
        this.changeMode.bind(this, editor, this.previousMode),
      ),
    );

    return command;
  }
}
