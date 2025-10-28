import { BaseOperation } from 'application/editor/operations/base';
import { MonomerCreationState } from 'application/render';
import {
  OperationType,
  AssignLeavingGroupAtomOperation,
} from 'application/editor';
import assert from 'assert';
import { AttachmentPointName } from 'domain/types';
import Restruct from 'application/render/restruct/restruct';

export class RemoveAttachmentPointOperation extends BaseOperation {
  private readonly atomPair: [number, number];

  constructor(
    private monomerCreationState: MonomerCreationState,
    private attachmentPointName: AttachmentPointName,
    private potentialLeavingAtoms: Set<number>,
  ) {
    super(OperationType.MONOMER_CREATION_REMOVE_AP);

    assert(this.monomerCreationState);

    const atomPair = this.monomerCreationState.assignedAttachmentPoints.get(
      this.attachmentPointName,
    );
    assert(atomPair);

    this.atomPair = atomPair;
  }

  execute(restruct: Restruct) {
    assert(this.monomerCreationState);

    const { assignedAttachmentPoints, potentialAttachmentPoints } =
      this.monomerCreationState;

    const [attachmentAtomId, leavingAtomId] = this.atomPair;
    assignedAttachmentPoints.delete(this.attachmentPointName);

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
    );
  }
}
