import { AssignAttachmentAtomOperation } from 'application/editor/operations/monomerCreation/AssignAttachmentAtomOperation';
import { Render } from 'application/render';
import type { MonomerCreationState } from 'application/render';
import { ReStruct } from 'application/render/restruct';
import type { RenderOptions } from 'application/render/render.types';
import { Struct } from 'domain/entities';
import { AttachmentPointName } from 'domain/types';

describe('AssignAttachmentAtomOperation', () => {
  const attachmentAtomId = 0;
  const leavingAtomId = 1;
  let restruct: ReStruct;
  let state: NonNullable<MonomerCreationState>;

  beforeEach(() => {
    const options = {
      scale: 40,
      width: 100,
      height: 100,
    } as unknown as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, options);
    restruct = new ReStruct(new Struct(), render);
    state = {
      assignedAttachmentPoints: new Map(),
      potentialAttachmentPoints: new Map([
        [attachmentAtomId, new Set([leavingAtomId])],
      ]),
      problematicAttachmentPoints: new Set(),
    };
  });

  it('should offer the leaving atom again after undo and assign it on redo (#12126)', () => {
    const operation = new AssignAttachmentAtomOperation(
      state,
      attachmentAtomId,
      leavingAtomId,
    );

    const undoOperation = operation.perform(restruct);

    expect(state.assignedAttachmentPoints.get(AttachmentPointName.R1)).toEqual([
      attachmentAtomId,
      leavingAtomId,
    ]);
    expect(state.potentialAttachmentPoints.has(attachmentAtomId)).toBe(false);

    const redoOperation = undoOperation.perform(restruct);

    expect(state.assignedAttachmentPoints.size).toBe(0);
    expect(state.potentialAttachmentPoints.get(attachmentAtomId)).toEqual(
      new Set([leavingAtomId]),
    );

    redoOperation.perform(restruct);

    expect(state.assignedAttachmentPoints.get(AttachmentPointName.R1)).toEqual([
      attachmentAtomId,
      leavingAtomId,
    ]);
    expect(state.potentialAttachmentPoints.has(attachmentAtomId)).toBe(false);
  });
});
