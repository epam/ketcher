import { BaseOperation } from 'application/editor/operations/BaseOperation';
import type { MonomerCreationState, ReStruct } from 'application/render';
import { OperationType } from 'application/editor/operations/OperationType';
import assert from 'assert';
import { getNextFreeAttachmentPoint } from 'domain/helpers';
import type { AttachmentPointName } from 'domain/types';
import type Restruct from 'application/render/restruct/restruct';

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
    private readonly _assignedAttachmentPoints?: Map<
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

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return new AssignLeavingGroupAtomOperation(
      this.monomerCreationState,
      leavingAtomId,
    );
  }
}

export class AssignLeavingGroupAtomOperation extends BaseOperation {
  private attachmentPointName: AttachmentPointName | null = null;
  private potentialLeavingAtoms: Set<number> = new Set();

  constructor(
    private readonly monomerCreationState: MonomerCreationState,
    private readonly atomId: number,
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
