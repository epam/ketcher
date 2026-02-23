import { Operation } from 'domain/entities/Operation';
import { EditorLineLength, SettingsManager } from 'utilities';

const getCoreEditorInstance = () => {
  const { CoreEditor } = require('application/editor/Editor');
  return CoreEditor.provideEditorInstance();
};

export class LineLengthChangeOperation implements Operation {
  private readonly previousLineLength: EditorLineLength;

  constructor(private readonly lineLengthUpdate: Partial<EditorLineLength>) {
    this.previousLineLength = SettingsManager.editorLineLength;
    this.execute();
  }

  public execute() {
    SettingsManager.editorLineLength = this.lineLengthUpdate;
    const editor = getCoreEditorInstance();
    editor.mode.initialize();
  }

  public invert() {
    SettingsManager.editorLineLength = this.previousLineLength;
    const editor = getCoreEditorInstance();
    editor.mode.initialize();
  }
}
