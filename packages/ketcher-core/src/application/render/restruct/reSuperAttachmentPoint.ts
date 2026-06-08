import { Bond } from 'domain/entities/bond';
import { Scale } from 'domain/helpers';
import { SuperAttachmentPoint } from 'domain/entities/superAttachmentPoint';

import { LayerMap } from './generalEnumTypes';
import { Render } from '../raphaelRender';
import ReAtom from './reatom';
import type ReStruct from './restruct';

class ReSuperAttachmentPoint extends ReAtom {
  // Narrow `this.a` to SuperAttachmentPoint for callers without runtime cost.
  declare a: SuperAttachmentPoint;

  constructor(superAttachmentPoint: SuperAttachmentPoint) {
    super(superAttachmentPoint);
  }

  static isSelectable(): boolean {
    return false;
  }

  show(restruct: ReStruct, aid: number): void {
    const struct = restruct.molecule;
    this.a.recomputeCenter(struct);

    for (const bond of struct.bonds.values()) {
      if (
        bond.type === Bond.PATTERN.TYPE.HAPTIC &&
        (bond.begin === aid || bond.end === aid)
      ) {
        return;
      }
    }

    const render = restruct.render;
    const pos = Scale.modelToCanvas(this.a.pp, render.options);
    const fontSize = render.options.fontsz;
    const path = render.paper.circle(pos.x, pos.y, fontSize * 0.8).attr({
      stroke: '#167782',
      'stroke-width': 1.5,
    });
    restruct.addReObjectPath(LayerMap.data, this.visel, path, null, true);
  }

  drawHover(render: Render, drawOutline = true) {
    if (!drawOutline) return;

    const struct = render.ctab.molecule;
    this.a.endpoints.forEach((eid) => {
      const reAtom = render.ctab.atoms.get(eid);
      if (reAtom && struct.atoms.has(eid)) {
        reAtom.drawHover(render, drawOutline);
      }
    });
  }
}

export default ReSuperAttachmentPoint;
