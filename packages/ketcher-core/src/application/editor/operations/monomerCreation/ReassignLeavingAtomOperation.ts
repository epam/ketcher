import { BaseOperation } from 'application/editor/operations/base';
import { OperationType } from 'application/editor';
import { MonomerCreationState, ReStruct } from 'application/render';
import assert from 'assert';
import { AttachmentPointName } from 'domain/types';

export class ReassignLeavingAtomOperation extends BaseOperation {
  constructor(
    private monomerCreationState: MonomerCreationState,
    private attachmentPointName: AttachmentPointName,
    private attachmentAtomId: number,
    private newLeavingAtomId: number,
    private previousLeavingAtomId: number,
  ) {
    super(OperationType.MONOMER_CREATION_REASSIGN_LGA);
  }

  execute(restruct: ReStruct) {
    assert(this.monomerCreationState);

    const newAtomPair: [number, number] = [
      this.attachmentAtomId,
      this.newLeavingAtomId,
    ];

    this.monomerCreationState.assignedAttachmentPoints.set(
      this.attachmentPointName,
      newAtomPair,
    );

    this.monomerCreationState = { ...(this.monomerCreationState || {}) };

    BaseOperation.invalidateAtom(restruct, this.attachmentAtomId);
    BaseOperation.invalidateAtom(restruct, this.newLeavingAtomId);
    BaseOperation.invalidateAtom(restruct, this.previousLeavingAtomId);
  }

  invert(): BaseOperation {
    return new ReassignLeavingAtomOperation(
      this.monomerCreationState,
      this.attachmentPointName,
      this.attachmentAtomId,
      this.previousLeavingAtomId,
      this.newLeavingAtomId,
    );
  }
}
