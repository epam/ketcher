import { provideEditorInstance } from 'application/editor/editorSingleton';
import type { Operation } from 'domain/entities/Operation';
import { type EditorLineLength, SettingsManager } from 'utilities';

export class LineLengthChangeOperation implements Operation {
  private readonly previousLineLength: EditorLineLength;

  constructor(private readonly lineLengthUpdate: Partial<EditorLineLength>) {
    this.previousLineLength = SettingsManager.editorLineLength;
    this.execute();
  }

  public execute() {
    SettingsManager.editorLineLength = this.lineLengthUpdate;
    const editor = provideEditorInstance();
    editor.mode.initialize();
  }

  public invert() {
    SettingsManager.editorLineLength = this.previousLineLength;
    const editor = provideEditorInstance();
    editor.mode.initialize();
  }
}
