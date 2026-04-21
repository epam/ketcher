import type { CoreEditor } from './Editor';

let editorInstance: CoreEditor | undefined;

export function provideEditorInstance(): CoreEditor {
  return editorInstance as CoreEditor;
}

export function setEditorInstance(editor: CoreEditor): void {
  editorInstance = editor;
}

export function resetEditorInstance(): void {
  editorInstance = undefined;
}
