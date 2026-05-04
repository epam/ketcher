import { BaseOperation } from 'application/editor/operations/BaseOperation';
import { MonomerCreationState } from 'application/render';
import {
  OperationType,
  AssignLeavingGroupAtomOperation,
} from 'application/editor';
import assert from 'assert';
import { AttachmentPointName } from 'domain/types';
import Restruct from 'application/render/restruct/restruct';

export class RemoveAttachmentPointOperation extends BaseOperation {
  private readonly attachmentAtomId: number;
  private readonly leavingAtomId: number;
  private readonly assignedAttachmentPoints: Map<
    number,
    { name: AttachmentPointName; leavingAtomId: number }
  > = new Map();

  constructor(
    private readonly monomerCreationState: MonomerCreationState,
    private readonly attachmentPointName: AttachmentPointName,
    private readonly potentialLeavingAtoms?: Set<number>,
    private _assignedAttachmentPoints?: Map<
      number,
      { name: AttachmentPointName; leavingAtomId: number }
    >,
  ) {
    super(OperationType.MONOMER_CREATION_REMOVE_AP);

    assert(this.monomerCreationState);

    this.assignedAttachmentPoints =
      this._assignedAttachmentPoints ||
      this.monomerCreationState.assignedAttachmentPoints;

    const entry = Array.from(this.assignedAttachmentPoints.entries()).find(
      ([, { name }]) => name === this.attachmentPointName,
    );
    assert(entry, `Attachment point "${this.attachmentPointName}" not found`);

    const [attachmentAtomId, { leavingAtomId }] = entry;
    this.attachmentAtomId = attachmentAtomId;
    this.leavingAtomId = leavingAtomId;
  }

  execute(restruct: Restruct) {
    assert(this.monomerCreationState);

    const { potentialAttachmentPoints } = this.monomerCreationState;

    this.assignedAttachmentPoints.delete(this.attachmentAtomId);

    if (this.potentialLeavingAtoms)
      potentialAttachmentPoints.set(
        this.attachmentAtomId,
        this.potentialLeavingAtoms,
      );

    BaseOperation.invalidateAtom(restruct, this.attachmentAtomId);
    BaseOperation.invalidateAtom(restruct, this.leavingAtomId);
  }

  invert() {
    return new AssignLeavingGroupAtomOperation(
      this.monomerCreationState,
      this.leavingAtomId,
    );
  }
}
