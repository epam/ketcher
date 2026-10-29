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

  static isSelectable(): true {
    return true;
  }

  private shouldShowMarker(render: Render) {
    const id = render.ctab.molecule.attachmentGroups.keyOf(this.a);
    return (
      id !== null && !isAttachmentGroupWithHapticBond(render.ctab.molecule, id)
    );
  }

  private getMarkerBackgroundColor(render: Render) {
    return this.selected
      ? String(render.options.selectionStyle.fill)
      : '#FFFFFF';
  }

<<<<<<< HEAD
  drawHover(render: Render, drawOutline = true) {
=======
  drawHover(render: Render, shouldDrawOutline = true) {
>>>>>>> origin/master
    const markerState = this.shouldShowMarker(render)
      ? 'hovered'
      : 'connectedHovered';

    return drawAttachmentGroupHover(
      this,
      render,
<<<<<<< HEAD
      drawOutline,
=======
      shouldDrawOutline,
>>>>>>> origin/master
      true,
      markerState,
      this.getMarkerBackgroundColor(render),
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

<<<<<<< HEAD
  setSelected(selected: boolean, restruct: ReStruct) {
    if (this.selected === selected) {
      return;
    }

    this.selected = selected;
=======
  setSelected(isSelected: boolean, restruct: ReStruct) {
    if (this.selected === isSelected) {
      return;
    }

    this.selected = isSelected;
>>>>>>> origin/master
    const id = restruct.molecule.attachmentGroups.keyOf(this.a);
    if (id !== null) {
      restruct.markAttachmentGroup(id, 0);
    }
  }

  makeSelectionPlate() {
    return null;
  }

<<<<<<< HEAD
  private redrawHover(render: Render, drawOutline = true) {
=======
  private redrawHover(render: Render, shouldDrawOutline = true) {
>>>>>>> origin/master
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
<<<<<<< HEAD
    this.drawHover(render, drawOutline);
    this.hovering = render.paper.setFinish();
  }

  setHover(hover: boolean, render: Render, drawOutline = true): boolean {
    this.hover = hover;
    this.centerMarkerHovered = hover;
    this.redrawHover(render, drawOutline);
=======
    this.drawHover(render, shouldDrawOutline);
    this.hovering = render.paper.setFinish();
  }

  setHover(
    isHovered: boolean,
    render: Render,
    shouldDrawOutline = true,
  ): boolean {
    this.hover = isHovered;
    this.centerMarkerHovered = isHovered;
    this.redrawHover(render, shouldDrawOutline);
>>>>>>> origin/master

    return this.hover;
  }

  show(restruct: ReStruct, id: number, _options: RenderOptions): void {
    this.a.recalculatePosition(restruct.molecule.atoms);

    const isConnected = isAttachmentGroupWithHapticBond(restruct.molecule, id);
    const markerState = isConnected
      ? 'connectedSelected'
      : this.selected
        ? 'selected'
        : 'default';
    if (!isConnected || this.selected) {
      const markerPosition = Scale.modelToCanvas(
        this.a.pp,
        restruct.render.options,
      );
      const marker = drawAttachmentGroupMarker(
        restruct.render,
        this.a.pp,
        markerState,
        this.getMarkerBackgroundColor(restruct.render),
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
