import {
  Atom,
  Editor,
  fromAtomsAttrs,
  fromRGroupAttachmentPointUpdate,
} from 'ketcher-core';

export async function editRGroupAttachmentPoint(
  editor: Editor,
  atom: Atom,
  atomId: number,
) {
  try {
    const newAtom = await editor.event.elementEdit.dispatch({
      attpnt: atom.attpnt,
    });

    const previousAttpnt = atom?.attpnt;
    const currentAttpnt = newAtom.attpnt;
    if (previousAttpnt !== currentAttpnt) {
      const actionFromAtomsAttrs = fromAtomsAttrs(
        editor.render.ctab,
        atomId,
        newAtom,
        null,
      );
      const actionFromRGroupAttachmentPointUpdate =
        fromRGroupAttachmentPointUpdate(
          editor.render.ctab,
          atomId,
          currentAttpnt,
        );
      const action = actionFromAtomsAttrs.mergeWith(
        actionFromRGroupAttachmentPointUpdate,
      );
      editor.update(action);
    }
  } catch (_error) {
    // close modal without any operations
  }
}
