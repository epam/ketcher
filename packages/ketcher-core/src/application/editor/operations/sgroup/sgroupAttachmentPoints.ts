import { BaseOperation } from '../base'
import { OperationType } from '../OperationType'
import { ReStruct } from '../../../render'
import { SGroupAttachmentPoint } from 'domain/entities/sGroupAttachmentPoint'
import assert from 'assert'

type Data = {
  sGroupId: number
  attachmentPoint: SGroupAttachmentPoint
}

export class SGroupAttachmentPointAdd extends BaseOperation {
  data: Data

  constructor(sGroupId: number, attachmentPoint: SGroupAttachmentPoint) {
    super(OperationType.S_GROUP_ATOM_ADD, 3)
    this.data = { sGroupId, attachmentPoint }
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule
    const sgroup = struct.sgroups.get(this.data.sGroupId)

    assert(sgroup != null)

    const attachmentPoint = this.data.attachmentPoint
    const apAtom = struct.atoms.get(attachmentPoint.atomId)

    if (!apAtom) {
      throw new Error(
        `attachmentPoint for Atom with id "${attachmentPoint.atomId}" is not found`
      )
    }

    sgroup.addAttachmentPoint(attachmentPoint)
  }

  invert() {
    return new SGroupAttachmentPointRemove(
      this.data.sGroupId,
      this.data.attachmentPoint
    )
  }
}

class SGroupAttachmentPointRemove extends BaseOperation {
  data: Data

  constructor(sGroupId: number, attachmentPoint: SGroupAttachmentPoint) {
    super(OperationType.S_GROUP_ATTACHMENT_POINT_REMOVE, 3)
    this.data = { sGroupId, attachmentPoint }
  }

  execute(restruct: ReStruct) {
    const { sGroupId, attachmentPoint } = this.data
    const struct = restruct.molecule
    const sgroup = struct.sgroups.get(sGroupId)
    assert(sgroup != null)

    sgroup.removeAttachmentPoint(attachmentPoint.atomId)
  }

  invert() {
    return new SGroupAttachmentPointAdd(
      this.data.sGroupId,
      this.data.attachmentPoint
    )
  }
}
