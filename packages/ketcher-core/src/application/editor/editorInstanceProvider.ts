import type { CoreEditor } from './Editor';

export type KetcherInstanceLike = {
  indigo: {
    convert: (...args: unknown[]) => Promise<{ struct: string }>;
  };
};

let editorInstance: CoreEditor | undefined;
let ketcherInstanceProvider:
  | ((id?: string) => KetcherInstanceLike)
  | undefined;

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

export function setKetcherInstanceProvider(
  provider: (id?: string) => KetcherInstanceLike,
) {
  ketcherInstanceProvider = provider;
}

export function provideKetcherInstance(id?: string): KetcherInstanceLike {
  if (!ketcherInstanceProvider) {
    throw new Error(
      'Ketcher instance provider is not initialized. Call setKetcherInstanceProvider() during Editor initialization.',
    );
  }

  return ketcherInstanceProvider(id);
}
