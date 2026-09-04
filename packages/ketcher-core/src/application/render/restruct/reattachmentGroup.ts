import type { AttachmentGroup } from 'domain/entities/attachmentGroup';
import type { RenderOptions } from 'application/render/render.types';
import type { Render } from '../raphaelRender';
import type ReStruct from './restruct';
import {
  drawAttachmentGroupMarker,
  drawAttachmentGroupHover,
} from './attachmentGroupRender';
import { LayerMap } from './generalEnumTypes';
import { isAttachmentGroupWithHapticBond, Scale } from 'domain/helpers';
import ReObject from './reobject';
import { Box2Abs } from 'domain/entities/box2Abs';
import type { ReBondEndpoint } from './rebondEndpoint';
import type { Vec2 } from 'domain/entities/vec2';

export class ReAttachmentGroup extends ReObject implements ReBondEndpoint {
  a: AttachmentGroup;
  showLabel = false;
  private centerMarkerHovered = false;

  constructor(attachmentGroup: AttachmentGroup) {
    super('attachmentGroup');
    this.a = attachmentGroup;
  }

  static isSelectable(): false {
    return false;
  }

  private shouldShowMarker(render: Render) {
    const id = render.ctab.molecule.attachmentGroups.keyOf(this.a);
    return (
      id !== null && !isAttachmentGroupWithHapticBond(render.ctab.molecule, id)
    );
  }

  drawHover(render: Render, drawOutline = true) {
    return drawAttachmentGroupHover(
      this,
      render,
      drawOutline,
      this.shouldShowMarker(render),
    );
  }

  getVBoxObj(render: Render): Box2Abs | null {
    if (this.visel.boundingBox) {
      return super.getVBoxObj(render);
    }
    return new Box2Abs(this.a.pp, this.a.pp);
  }

  getShiftedSegmentPosition(
    renderOptions: RenderOptions,
    _direction: Vec2,
    atomPosition = this.a.pp,
  ): Vec2 {
    return Scale.modelToCanvas(atomPosition, renderOptions);
  }

  private redrawHover(render: Render, drawOutline = true) {
    const previousHoverPaths = new Set<unknown>();
    if (this.hovering?.type === 'set') {
      this.hovering.forEach((path) => previousHoverPaths.add(path));
    } else if (this.hovering) {
      previousHoverPaths.add(this.hovering);
    }

    this.hovering?.remove();
    this.hovering = null;
    this.visel.paths = this.visel.paths.filter(
      (path) => !previousHoverPaths.has(path),
    );

    if (!this.centerMarkerHovered) {
      return;
    }

    render.paper.setStart();
    this.drawHover(render, drawOutline);
    this.hovering = render.paper.setFinish();
  }

  setHover(hover: boolean, render: Render, drawOutline = true): boolean {
    this.hover = hover;
    this.centerMarkerHovered = hover;
    this.redrawHover(render, drawOutline);

    return this.hover;
  }

  show(restruct: ReStruct, id: number, _options: RenderOptions): void {
    this.a.recalculatePosition(restruct.molecule.atoms);

    if (!isAttachmentGroupWithHapticBond(restruct.molecule, id)) {
      const markerPosition = Scale.modelToCanvas(
        this.a.pp,
        restruct.render.options,
      );
      const marker = drawAttachmentGroupMarker(
        restruct.render,
        this.a.pp,
        'default',
      );
      restruct.addReObjectPath(
        LayerMap.data,
        this.visel,
        marker,
        markerPosition,
        true,
      );
    }

    this.redrawHover(restruct.render);
  }
}
