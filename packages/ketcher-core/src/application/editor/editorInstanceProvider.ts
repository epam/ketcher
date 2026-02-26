import type { CoreEditor } from './Editor';

let editorInstance: CoreEditor | undefined;

export function setEditorInstance(editor: CoreEditor) {
  editorInstance = editor;
}

export function provideEditorInstance(): CoreEditor {
  if (!editorInstance) {
    throw new Error('Core editor instance is not initialized');
  }

  return editorInstance;
}

export function resetEditorInstance() {
  editorInstance = undefined;
}
