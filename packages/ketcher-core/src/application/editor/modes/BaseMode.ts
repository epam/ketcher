import { Command } from 'domain/entities/Command';
import { SelectLayoutModeOperation } from '../operations/polymerBond';
import { CoreEditor } from '../internal';
import { LayoutMode, modesMap } from 'application/editor/modes';

export abstract class BaseMode {
  protected constructor(
    public modeName: LayoutMode,
    public previousMode: LayoutMode = 'flex-layout-mode',
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
        this.modeName,
        this.previousMode,
      ),
    );

    editor.events.selectTool.dispatch('select-rectangle');

    return command;
  }
}
