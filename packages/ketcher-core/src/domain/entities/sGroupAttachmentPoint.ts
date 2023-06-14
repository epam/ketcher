export class SGroupAttachmentPoint {
  public readonly atomId: number
  public readonly leaveAtomId: number
  public readonly additionalData: string

  constructor(
    atomId: number,
    leaveAtomId: number | undefined,
    additionalData: string | undefined
  ) {
    this.atomId = atomId
    this.leaveAtomId = leaveAtomId ?? -1
    this.additionalData =
      additionalData != null ? String(additionalData).slice(0, 2) : '  '
  }
}
