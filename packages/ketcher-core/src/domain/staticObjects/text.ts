export type TextEditResolution = 'create' | 'update' | 'delete' | 'noop';

export function resolveTextEdit(edit: {
  isNew: boolean;
  originalContent: string;
  nextContent: string;
}): TextEditResolution {
  if (edit.isNew) {
    return edit.nextContent ? 'create' : 'noop';
  }
  if (!edit.nextContent) {
    return 'delete';
  }
  return edit.nextContent === edit.originalContent ? 'noop' : 'update';
}
