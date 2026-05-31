import { Editor, fromPaste, Struct, Vec2 } from 'ketcher-core';

export const createCopyOfSelected = (editor: Editor, point: Vec2) => {
  const restruct = editor.render.ctab;

  const struct: Struct = editor.structSelected();
  struct.findConnectedComponents();
  struct.setImplicitHydrogen();
  struct.setStereoLabelsToAtoms();
  struct.markFragments();

  const [action, , items] = fromPaste(restruct, struct, point);
  editor.update(action, true);
  return { action, items };
};
