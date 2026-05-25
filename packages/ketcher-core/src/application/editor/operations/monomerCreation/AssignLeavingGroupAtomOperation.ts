import { BaseOperation } from 'application/editor/operations/BaseOperation';
import {
  AssignedAttachmentPoints,
  AttachmentPointId,
  getAttachmentPointNames,
  getNextAttachmentPointId,
  MonomerCreationState,
  ReStruct,
} from 'application/render';
import { OperationType } from 'application/editor/operations/OperationType';
import assert from 'assert';
import { getNextFreeAttachmentPoint } from 'domain/helpers';
import { AttachmentPointName } from 'domain/types';
import { RemoveAttachmentPointOperation } from './RemoveAttachmentPointOperation';

export class AssignLeavingGroupAtomOperation extends BaseOperation {
  private attachmentPointId: AttachmentPointId | null = null;
  private potentialLeavingAtoms: Set<number> = new Set();

  constructor(
    private readonly monomerCreationState: MonomerCreationState,
    private readonly atomId: number,
    private readonly _attachmentPointName?: AttachmentPointName,
    private readonly _assignedAttachmentPoints?: AssignedAttachmentPoints,
    private readonly _attachmentPointId?: AttachmentPointId,
  ) {
    super(OperationType.MONOMER_CREATION_ASSIGN_LGA);
  }

  execute(restruct: ReStruct) {
    assert(this.monomerCreationState);

    const { potentialAttachmentPoints } = this.monomerCreationState;
    const assignedAttachmentPoints =
      this._assignedAttachmentPoints ??
      this.monomerCreationState.assignedAttachmentPoints;

    let atomPairForLeavingGroup: [number, number] | null = null;
    for (const attachmentPointAtoms of potentialAttachmentPoints.entries()) {
      const [attachmentAtomId, leavingAtomIds] = attachmentPointAtoms;
      if (leavingAtomIds.has(this.atomId)) {
        atomPairForLeavingGroup = [attachmentAtomId, this.atomId];
        break;
      }
    }

    if (!atomPairForLeavingGroup) {
      return;
    }

    const [attachmentAtomId, leavingAtomId] = atomPairForLeavingGroup;

    const attachmentPointName =
      this._attachmentPointName ??
      getNextFreeAttachmentPoint(
        getAttachmentPointNames(assignedAttachmentPoints),
      );
    const attachmentPointId =
      this._attachmentPointId ??
      getNextAttachmentPointId(this.monomerCreationState);
    this.attachmentPointId = attachmentPointId;
    assignedAttachmentPoints.set(attachmentPointId, {
      name: attachmentPointName,
      attachmentAtomId,
      leavingAtomId,
    });

    const potentialAttachmentAtoms =
      potentialAttachmentPoints.get(attachmentAtomId);
    assert(potentialAttachmentAtoms);

    this.potentialLeavingAtoms = potentialAttachmentAtoms;
    potentialAttachmentPoints.delete(attachmentAtomId);

    BaseOperation.invalidateAtom(restruct, leavingAtomId);
    BaseOperation.invalidateAtom(restruct, attachmentAtomId);
  }

  invert() {
    assert(this.attachmentPointId !== null);

    return new RemoveAttachmentPointOperation(
      this.monomerCreationState,
      this.attachmentPointId,
      this.potentialLeavingAtoms,
    );
  }
}
