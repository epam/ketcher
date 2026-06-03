import { BaseOperation } from 'application/editor/operations/BaseOperation';
import { OperationType } from 'application/editor/operations/OperationType';
import type {
  AttachmentPointId,
  MonomerCreationState,
  ReStruct,
} from 'application/render';
import assert from 'assert';

export class ReassignLeavingAtomOperation extends BaseOperation {
  constructor(
    private monomerCreationState: MonomerCreationState,
    private readonly attachmentPointId: AttachmentPointId,
    private readonly attachmentAtomId: number,
    private readonly newLeavingAtomId: number,
    private readonly previousLeavingAtomId: number,
  ) {
    super(OperationType.MONOMER_CREATION_REASSIGN_LGA);
  }

  execute(restruct: ReStruct) {
    assert(this.monomerCreationState);

    const attachmentPoint =
      this.monomerCreationState.assignedAttachmentPoints.get(
        this.attachmentPointId,
      );
    assert(attachmentPoint);

    this.monomerCreationState.assignedAttachmentPoints.set(
      this.attachmentPointId,
      {
        ...attachmentPoint,
        attachmentAtomId: this.attachmentAtomId,
        leavingAtomId: this.newLeavingAtomId,
      },
    );

    this.monomerCreationState = { ...(this.monomerCreationState || {}) };

    BaseOperation.invalidateAtom(restruct, this.attachmentAtomId);
    BaseOperation.invalidateAtom(restruct, this.newLeavingAtomId);
    BaseOperation.invalidateAtom(restruct, this.previousLeavingAtomId);
  }

  invert(): BaseOperation {
    return new ReassignLeavingAtomOperation(
      this.monomerCreationState,
      this.attachmentPointId,
      this.attachmentAtomId,
      this.previousLeavingAtomId,
      this.newLeavingAtomId,
    );
  }
}
