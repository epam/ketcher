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
  private readonly assignedAttachmentPoints: Map<
    AttachmentPointName,
    [number, number]
  > = new Map();

  constructor(
    private readonly monomerCreationState: MonomerCreationState,
    private readonly attachmentPointName: AttachmentPointName,
    private readonly potentialLeavingAtoms?: Set<number>,
    private _assignedAttachmentPoints?: Map<
      AttachmentPointName,
      [number, number]
    >,
  ) {
    super(OperationType.MONOMER_CREATION_REMOVE_AP);

    assert(this.monomerCreationState);

    this.assignedAttachmentPoints =
      this._assignedAttachmentPoints ||
      this.monomerCreationState.assignedAttachmentPoints;
    const atomPair = this.assignedAttachmentPoints.get(
      this.attachmentPointName,
    );

    assert(atomPair);

    this.atomPair = atomPair;
  }

  execute(restruct: Restruct) {
    assert(this.monomerCreationState);

    const { potentialAttachmentPoints } = this.monomerCreationState;

    const [attachmentAtomId, leavingAtomId] = this.atomPair;
    this.assignedAttachmentPoints.delete(this.attachmentPointName);

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
