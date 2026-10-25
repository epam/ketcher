import {
  type Atom,
  type Editor,
  fromAtomsAttrs,
  fromRGroupAttachmentPointUpdate,
  KetcherLogger,
} from 'ketcher-core';

export async function editRGroupAttachmentPoint(
  editor: Editor,
  atom: Atom,
  atomId: number,
) {
  try {
    const newAtom = await editor.event.elementEdit.dispatch({
      attachmentPoints: atom.attachmentPoints,
    });

    const previousAttachmentPoints = atom?.attachmentPoints;
    const currentAttachmentPoints = newAtom.attachmentPoints;
    if (previousAttachmentPoints !== currentAttachmentPoints) {
      const actionFromAtomsAttributes = fromAtomsAttrs(
        editor.render.ctab,
        atomId,
        newAtom,
        null,
      );
      const actionFromRGroupAttachmentPointUpdate =
        fromRGroupAttachmentPointUpdate(
          editor.render.ctab,
          atomId,
          currentAttachmentPoints,
        );
      const action = actionFromAtomsAttributes.mergeWith(
        actionFromRGroupAttachmentPointUpdate,
      );
      editor.update(action);
    }
  } catch (error) {
    KetcherLogger.error(
      'apoint.utilities.ts::editRGroupAttachmentPoint',
      error,
    );
    // close modal without any operations
  }
}
