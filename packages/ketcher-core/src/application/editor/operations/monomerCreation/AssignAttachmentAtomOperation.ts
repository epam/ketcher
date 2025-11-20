import { BaseOperation } from 'application/editor/operations/base';
import { MonomerCreationState, ReStruct } from 'application/render';
import {
  OperationType,
  RemoveAttachmentPointOperation,
} from 'application/editor';
import assert from 'assert';
import { AttachmentPointName } from 'domain/types';
import { getNextFreeAttachmentPoint } from 'domain/helpers';

export class AssignAttachmentAtomOperation extends BaseOperation {
  private attachmentPointName: AttachmentPointName | null = null;

  constructor(
    private readonly monomerCreationState: MonomerCreationState,
    private readonly attachmentAtomId: number,
    private readonly leavingAtomId: number,
    private readonly _attachmentPointName?: AttachmentPointName,
  ) {
    super(OperationType.MONOMER_CREATION_ASSIGN_AA);
  }

  execute(restruct: ReStruct) {
    assert(this.monomerCreationState);

    const { assignedAttachmentPoints, potentialAttachmentPoints } =
      this.monomerCreationState;

    this.attachmentPointName =
      this._attachmentPointName ||
      getNextFreeAttachmentPoint(Array.from(assignedAttachmentPoints.keys()));

    assignedAttachmentPoints.set(this.attachmentPointName, [
      this.attachmentAtomId,
      this.leavingAtomId,
    ]);
    potentialAttachmentPoints.delete(this.attachmentAtomId);

    BaseOperation.invalidateAtom(restruct, this.attachmentAtomId);
    BaseOperation.invalidateAtom(restruct, this.leavingAtomId);
  }

  invert(): BaseOperation {
    assert(this.attachmentPointName !== null);

    return new RemoveAttachmentPointOperation(
      this.monomerCreationState,
      this.attachmentPointName,
    );
  }
}
