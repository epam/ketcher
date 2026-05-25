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
import { RemoveAttachmentPointOperation } from './RemoveAttachmentPointOperation';
import assert from 'assert';
import { AttachmentPointName } from 'domain/types';
import { getNextFreeAttachmentPoint } from 'domain/helpers';

export class AssignAttachmentAtomOperation extends BaseOperation {
  private attachmentPointId: AttachmentPointId | null = null;
  private attachmentPointName: AttachmentPointName | null = null;
  private assignedAttachmentPoints: AssignedAttachmentPoints = new Map();

  constructor(
    private readonly monomerCreationState: MonomerCreationState,
    private readonly attachmentAtomId: number,
    private readonly leavingAtomId: number,
    private readonly _attachmentPointName?: AttachmentPointName,
    private readonly _assignedAttachmentPoints?: AssignedAttachmentPoints,
    private readonly _attachmentPointId?: AttachmentPointId,
  ) {
    super(OperationType.MONOMER_CREATION_ASSIGN_AA);
  }

  execute(restruct: ReStruct) {
    assert(this.monomerCreationState);

    const { potentialAttachmentPoints } = this.monomerCreationState;
    this.assignedAttachmentPoints =
      this._assignedAttachmentPoints ??
      this.monomerCreationState.assignedAttachmentPoints;

    this.attachmentPointId =
      this._attachmentPointId ??
      getNextAttachmentPointId(this.monomerCreationState);
    this.attachmentPointName =
      this._attachmentPointName ??
      getNextFreeAttachmentPoint(
        getAttachmentPointNames(this.assignedAttachmentPoints),
      );

    this.assignedAttachmentPoints.set(this.attachmentPointId, {
      name: this.attachmentPointName,
      attachmentAtomId: this.attachmentAtomId,
      leavingAtomId: this.leavingAtomId,
    });
    potentialAttachmentPoints.delete(this.attachmentAtomId);

    BaseOperation.invalidateAtom(restruct, this.attachmentAtomId);
    BaseOperation.invalidateAtom(restruct, this.leavingAtomId);
  }

  invert(): BaseOperation {
    assert(this.attachmentPointId !== null);
    assert(this.attachmentPointName !== null);

    return new RemoveAttachmentPointOperation(
      this.monomerCreationState,
      this.attachmentPointId,
      undefined,
      this.assignedAttachmentPoints,
    );
  }
}
