import type { CoreEditor } from './Editor';

const editorInstances = new Map<string, CoreEditor>();

let _renderingContext: CoreEditor | undefined;
// fallback for a single editor instance without a ketcherId, for example in tests or in a single-editor application
let _lastEditorInstance: CoreEditor | undefined;

export function setEditorRenderingContext(
  editor: CoreEditor | undefined,
): void {
  _renderingContext = editor;
}

export function setEditorInstance(editor: CoreEditor): void {
  _lastEditorInstance = editor;
  if (editor.ketcherId) {
    editorInstances.set(editor.ketcherId, editor);
  }
}

export function resetEditorInstance(ketcherId?: string): void {
  if (ketcherId) {
    editorInstances.delete(ketcherId);
  }
  if (_lastEditorInstance?.ketcherId === ketcherId) {
    _lastEditorInstance = undefined;
  }
}

export function provideEditorInstance(ketcherId?: string): CoreEditor {
  if (_renderingContext) return _renderingContext;
  if (ketcherId) {
    const editor = editorInstances.get(ketcherId);
    if (editor) return editor;
  }
  // Fall back to the most recently registered instance for callers without context
  const values = [...editorInstances.values()];
  return (values[values.length - 1] ?? _lastEditorInstance) as CoreEditor;
}
