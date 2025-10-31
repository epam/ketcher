import { BaseOperation } from 'application/editor/operations/base';
import { MonomerCreationState, ReStruct } from 'application/render';
import {
  OperationType,
  RemoveAttachmentPointOperation,
} from 'application/editor';
import assert from 'assert';
import { getNextFreeAttachmentPoint } from 'domain/helpers';
import { AttachmentPointName } from 'domain/types';

export class AssignLeavingGroupAtomOperation extends BaseOperation {
  private attachmentPointName: AttachmentPointName | null = null;
  private potentialLeavingAtoms: Set<number> = new Set();

  constructor(
    private monomerCreationState: MonomerCreationState,
    private atomId: number,
  ) {
    super(OperationType.MONOMER_CREATION_ASSIGN_LGA);
  }

  execute(restruct: ReStruct) {
    assert(this.monomerCreationState);

    const { assignedAttachmentPoints, potentialAttachmentPoints } =
      this.monomerCreationState;

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

    const attachmentPointName = getNextFreeAttachmentPoint(
      Array.from(assignedAttachmentPoints.keys()),
    );
    this.attachmentPointName = attachmentPointName;

    assignedAttachmentPoints.set(attachmentPointName, atomPairForLeavingGroup);

    const potentialAttachmentAtoms =
      potentialAttachmentPoints.get(attachmentAtomId);
    assert(potentialAttachmentAtoms);

    this.potentialLeavingAtoms = potentialAttachmentAtoms;
    potentialAttachmentPoints.delete(attachmentAtomId);

    BaseOperation.invalidateAtom(restruct, leavingAtomId);
    BaseOperation.invalidateAtom(restruct, attachmentAtomId);
  }

  invert() {
    assert(this.attachmentPointName !== null);

    return new RemoveAttachmentPointOperation(
      this.monomerCreationState,
      this.attachmentPointName,
      this.potentialLeavingAtoms,
    );
  }
}
