import { BaseOperation } from 'application/editor/operations/BaseOperation';
import {
  getAttachmentPointAtomPair,
  type AssignedAttachmentPoint,
  type AssignedAttachmentPoints,
  type AttachmentPointId,
  type MonomerCreationState,
} from 'application/render';
import { OperationType } from 'application/editor/operations/OperationType';
import assert from 'assert';
import type Restruct from 'application/render/restruct/restruct';

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
    return createRestoreAttachmentPointOperation(
      this.monomerCreationState,
      this.attachmentPointId,
      this.attachmentPoint,
      this.assignedAttachmentPoints,
      this.potentialLeavingAtoms,
    );
  }
}

function createRestoreAttachmentPointOperation(
  monomerCreationState: MonomerCreationState,
  attachmentPointId: AttachmentPointId,
  attachmentPoint: AssignedAttachmentPoint,
  assignedAttachmentPoints: AssignedAttachmentPoints,
  potentialLeavingAtoms?: Set<number>,
): BaseOperation {
  class RestoreAttachmentPointOperation extends BaseOperation {
    constructor() {
      super(OperationType.MONOMER_CREATION_ASSIGN_LGA);
    }

    execute(restruct: Restruct) {
      assert(monomerCreationState);

      const { potentialAttachmentPoints } = monomerCreationState;

      assignedAttachmentPoints.set(attachmentPointId, {
        ...attachmentPoint,
      });

      if (potentialLeavingAtoms) {
        potentialAttachmentPoints.delete(attachmentPoint.attachmentAtomId);
      }

      BaseOperation.invalidateAtom(restruct, attachmentPoint.attachmentAtomId);
      BaseOperation.invalidateAtom(restruct, attachmentPoint.leavingAtomId);
    }

    invert() {
      return new RemoveAttachmentPointOperation(
        monomerCreationState,
        attachmentPointId,
        potentialLeavingAtoms,
        assignedAttachmentPoints,
      );
    }
  }

  return new RestoreAttachmentPointOperation();
}
