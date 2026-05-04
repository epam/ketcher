import { Bond } from 'domain/entities/bond';
import { HapticBond } from 'domain/entities/HapticBond';
import { SuperAttachmentPoint } from 'domain/entities/superAttachmentPoint';
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

  drawHover(_render: Render): RaphaelPath {
    // Hover-outline implementation lives in D2 (S-group-style outline of
    // member atoms + their internal bonds). Stub for now to avoid the
    // ReObject base-class throw.
    return null;
  }
}

export default ReSuperAttachmentPoint;
