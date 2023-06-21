import assert from 'assert'

export class SGroupAttachmentPoint {
  public readonly atomId: number
  public readonly leaveAtomId: number | undefined
  public readonly additionalData: string

  constructor(
    atomId: number,
    leaveAtomId: number | undefined,
    additionalData: string | undefined
  ) {
    this.atomId = atomId
    this.leaveAtomId = leaveAtomId
    this.additionalData =
      additionalData != null ? String(additionalData).slice(0, 2) : '  '
  }

  clone(atomIdMap: Map<number, number>): SGroupAttachmentPoint {
    const newAtomId = atomIdMap.get(this.atomId)
    assert(newAtomId != null)
    const newLeaveAtomId = atomIdMap.get(this.leaveAtomId as number)
    return new SGroupAttachmentPoint(
      newAtomId,
      newLeaveAtomId,
      this.additionalData
    )
  }
}
