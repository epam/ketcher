import { BaseOperation } from 'application/editor/operations/BaseOperation';
import type { MonomerCreationState, ReStruct } from 'application/render';
import { OperationType } from 'application/editor/operations/OperationType';
import { RemoveAttachmentPointOperation } from './RemoveAttachmentPointOperation';
import { assert } from 'utilities';
import type { AttachmentPointName } from 'domain/types';
import { getNextFreeAttachmentPoint } from 'domain/helpers';

export class AssignAttachmentAtomOperation extends BaseOperation {
  private attachmentPointName: AttachmentPointName | null = null;
  private assignedAttachmentPoints: Map<AttachmentPointName, [number, number]> =
    new Map();
  private potentialLeavingAtoms?: Set<number>;

  constructor(
    private readonly monomerCreationState: MonomerCreationState,
    private readonly attachmentAtomId: number,
    private readonly leavingAtomId: number,
    private readonly _attachmentPointName?: AttachmentPointName,
    private readonly _assignedAttachmentPoints?: Map<
      AttachmentPointName,
      [number, number]
    >,
  ) {
    super(OperationType.MONOMER_CREATION_ASSIGN_AA);
  }

  execute(restruct: ReStruct) {
    assert(this.monomerCreationState);

    const { potentialAttachmentPoints, connectionAttachmentPoints } =
      this.monomerCreationState;
    this.assignedAttachmentPoints =
      this._assignedAttachmentPoints ??
      this.monomerCreationState.assignedAttachmentPoints;

    const occupiedAttachmentPointNames = new Set([
      ...this.assignedAttachmentPoints.keys(),
      ...(this._assignedAttachmentPoints
        ? []
        : (connectionAttachmentPoints?.keys() ?? [])),
    ]);

    this.attachmentPointName =
      this._attachmentPointName ??
      getNextFreeAttachmentPoint([...occupiedAttachmentPointNames]);

    this.assignedAttachmentPoints.set(this.attachmentPointName, [
      this.attachmentAtomId,
      this.leavingAtomId,
    ]);
    // Kept so that undo can offer these atoms as leaving groups again
    this.potentialLeavingAtoms = potentialAttachmentPoints.get(
      this.attachmentAtomId,
    );
    potentialAttachmentPoints.delete(this.attachmentAtomId);

    BaseOperation.invalidateAtom(restruct, this.attachmentAtomId);
    BaseOperation.invalidateAtom(restruct, this.leavingAtomId);
  }

  invert(): BaseOperation {
    assert(this.attachmentPointName !== null);

    return new RemoveAttachmentPointOperation(
      this.monomerCreationState,
      this.attachmentPointName,
      this.potentialLeavingAtoms,
      this.assignedAttachmentPoints,
    );
  }
}
