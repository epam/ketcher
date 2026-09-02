import { AttachmentGroup } from 'domain/entities/attachmentGroup';
import type { RenderOptions } from 'application/render/render.types';
import type { Render } from '../raphaelRender';
import ReAtom from './reatom';
import type ReStruct from './restruct';
import {
  drawAttachmentGroupHover,
  type AttachmentGroupHoverHost,
} from './attachmentGroupRender';

export class ReAttachmentGroup extends ReAtom {
  declare a: AttachmentGroup;

  constructor(attachmentGroup: AttachmentGroup) {
    super(attachmentGroup);
    this.a = attachmentGroup;
  }

  static isSelectable(): false {
    return false;
  }

  drawHover(render: Render, drawOutline = true) {
    return drawAttachmentGroupHover(
      this as unknown as AttachmentGroupHoverHost,
      render,
      drawOutline,
    );
  }

  show(restruct: ReStruct, id: number, options: RenderOptions): void {
    this.a.recalculatePosition(restruct.molecule.atoms);
    super.show(restruct, id, options);
  }
}
