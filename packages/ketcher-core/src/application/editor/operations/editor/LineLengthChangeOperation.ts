import { Operation } from 'domain/entities/Operation';
import { EditorLineLength, SettingsManager } from 'utilities';
import { CoreEditor } from 'application/editor';

export class LineLengthChangeOperation implements Operation {
  private readonly previousLineLength: EditorLineLength;

  constructor(
    private readonly lineLengthUpdate: Partial<EditorLineLength>,
    private _coreEditorId: string,
  ) {
    this.previousLineLength = SettingsManager.editorLineLength;
    this.execute();
  }

  public execute() {
    SettingsManager.editorLineLength = this.lineLengthUpdate;
    const editor = CoreEditor.provideEditorInstance(this._coreEditorId);
    editor.mode.initialize();
  }

  public invert() {
    SettingsManager.editorLineLength = this.previousLineLength;
    const editor = CoreEditor.provideEditorInstance(this._coreEditorId);
    editor.mode.initialize();
  }
}
