import { DrawingEntity } from './DrawingEntity';
import type { Atom } from './CoreAtom';
import type { RGroupAttachmentPoint } from './rgroupAttachmentPoint';

export class RGroupAttachmentPointDrawingEntity extends DrawingEntity {
  constructor(
    public readonly atom: Atom,
    public readonly point: RGroupAttachmentPoint,
  ) {
    super();
  }

  public get center() {
    return this.atom.position;
  }
}
