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

type AssignLeavingGroupAtomOperationCtor = new (
  monomerCreationState: MonomerCreationState,
  atomId: number,
  attachmentPointName?: AssignedAttachmentPoint['name'],
  assignedAttachmentPoints?: AssignedAttachmentPoints,
  attachmentPointId?: AttachmentPointId,
) => BaseOperation;

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

    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const { AssignLeavingGroupAtomOperation } = require('./' +
      'AssignLeavingGroupAtomOperation') as {
      AssignLeavingGroupAtomOperation: AssignLeavingGroupAtomOperationCtor;
    };

    return new AssignLeavingGroupAtomOperation(
      this.monomerCreationState,
      leavingAtomId,
      this.attachmentPoint.name,
      this.assignedAttachmentPoints,
      this.attachmentPointId,
    );
  }
}
