import { BaseOperation } from 'application/editor/operations/BaseOperation';
import {
  AssignedAttachmentPoint,
  AssignedAttachmentPoints,
  AttachmentPointId,
  getAttachmentPointAtomPair,
  MonomerCreationState,
} from 'application/render';
import {
  OperationType,
  AssignLeavingGroupAtomOperation,
} from 'application/editor';
import assert from 'assert';
import Restruct from 'application/render/restruct/restruct';

export class RemoveAttachmentPointOperation extends BaseOperation {
  private readonly atomPair: [number, number];
  private readonly attachmentPoint: AssignedAttachmentPoint;
  private readonly assignedAttachmentPoints: AssignedAttachmentPoints =
    new Map();

  constructor(
    private readonly monomerCreationState: MonomerCreationState,
    private readonly attachmentPointId: AttachmentPointId,
    private readonly potentialLeavingAtoms?: Set<number>,
    private _assignedAttachmentPoints?: AssignedAttachmentPoints,
  ) {
    super(OperationType.MONOMER_CREATION_REMOVE_AP);

    assert(this.monomerCreationState);

    this.assignedAttachmentPoints =
      this._assignedAttachmentPoints ||
      this.monomerCreationState.assignedAttachmentPoints;
    const attachmentPoint = this.assignedAttachmentPoints.get(
      this.attachmentPointId,
    );

    assert(attachmentPoint);

    this.attachmentPoint = attachmentPoint;
    this.atomPair = getAttachmentPointAtomPair(attachmentPoint);
  }

  execute(restruct: Restruct) {
    assert(this.monomerCreationState);

    const { potentialAttachmentPoints } = this.monomerCreationState;

    const [attachmentAtomId, leavingAtomId] = this.atomPair;
    this.assignedAttachmentPoints.delete(this.attachmentPointId);

    if (this.potentialLeavingAtoms)
      potentialAttachmentPoints.set(
        attachmentAtomId,
        this.potentialLeavingAtoms,
      );

    BaseOperation.invalidateAtom(restruct, attachmentAtomId);
    BaseOperation.invalidateAtom(restruct, leavingAtomId);
  }

  invert() {
    const leavingAtomId = this.atomPair[1];

    return new AssignLeavingGroupAtomOperation(
      this.monomerCreationState,
      leavingAtomId,
      this.attachmentPoint.name,
      this.assignedAttachmentPoints,
      this.attachmentPointId,
    );
  }
}
