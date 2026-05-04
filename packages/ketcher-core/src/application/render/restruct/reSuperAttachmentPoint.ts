import { Bond } from 'domain/entities/bond';
import { HapticBond } from 'domain/entities/HapticBond';
import { SuperAttachmentPoint } from 'domain/entities/superAttachmentPoint';
import { Vec2 } from 'domain/entities/vec2';
import { Scale } from 'domain/helpers';
import { Render } from '../raphaelRender';

import ReObject from './reobject';
import type ReStruct from './restruct';
import { LayerMap } from './generalEnumTypes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RaphaelPath = any;

class ReSuperAttachmentPoint extends ReObject {
  sap: SuperAttachmentPoint;
  path: RaphaelPath = null;

  constructor(sap: SuperAttachmentPoint) {
    super('superAttachmentPoint');
    this.sap = sap;
  }

  static isSelectable() {
    return true;
  }

  static isHidden(sapId: number, restruct: ReStruct): boolean {
    const struct = restruct.molecule;
    for (const bond of struct.bonds.values()) {
      if (
        bond.type === Bond.PATTERN.TYPE.HAPTIC &&
        bond instanceof HapticBond &&
        bond.sapId === sapId
      ) {
        return true;
      }
    }
    return false;
  }

  show(restruct: ReStruct, sapId: number): void {
    const render = restruct.render;
    const struct = restruct.molecule;
    this.sap.recomputeCenter(struct);

    if (ReSuperAttachmentPoint.isHidden(sapId, restruct)) {
      return;
    }

    const pos = Scale.modelToCanvas(this.sap.pp, render.options);
    const fontSize = render.options.fontsz;
    this.path = render.paper.text(pos.x, pos.y, '*').attr({
      'font-size': fontSize * 1.6,
      'font-weight': 'bold',
      fill: '#000',
    });
    restruct.addReObjectPath(LayerMap.data, this.visel, this.path, null, true);
    this.setHover(this.hover, render);
  }

  drawHover(render: Render): RaphaelPath {
    // S-group-style outline: a rounded rectangle around the member atoms'
    // bounding box. The visual matches the spec's "Appearance copied from
    // S-groups visualization" requirement; refinement (full convex hull,
    // bond highlighting) can come in polish.
    const struct = render.ctab.molecule;
    const memberPositions = this.sap.atoms
      .map((aid) => struct.atoms.get(aid)?.pp)
      .filter((p): p is NonNullable<typeof p> => p !== undefined);
    if (memberPositions.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const p of memberPositions) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    // Expand by an atom radius so the outline isn't flush against atoms.
    const padding = 0.5;
    const tl = Scale.modelToCanvas(
      new Vec2(minX - padding, minY - padding),
      render.options,
    );
    const br = Scale.modelToCanvas(
      new Vec2(maxX + padding, maxY + padding),
      render.options,
    );

    const radius = render.options.fontsz * 0.4;
    return render.paper
      .rect(tl.x, tl.y, br.x - tl.x, br.y - tl.y, radius)
      .attr(render.options.hoverStyle);
  }
}

export default ReSuperAttachmentPoint;
