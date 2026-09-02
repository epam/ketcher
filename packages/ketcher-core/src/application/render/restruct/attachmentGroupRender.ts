import type { Atom } from 'domain/entities/atom';
import { AttachmentGroup } from 'domain/entities/attachmentGroup';
import { LayerMap } from './generalEnumTypes';
import { paperPathFromSVGElement } from './resgroup';
import type { Render } from '../raphaelRender';
import type Visel from './visel';
import paperjs from 'paper';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface AttachmentGroupHoverHost {
  a: AttachmentGroup;
  visel: Visel;
  makeHoverPlate(render: Render, drawOutline: boolean): any;
  attachHighlightTriggerForAttachmentPointAtom(
    hoverElement: any,
    render: Render,
  ): void;
  drawHoverForPotentialAttachmentPointAtomsInMonomerCreationWizard(
    render: Render,
    drawOutline: boolean,
  ): void;
}

export function getAttachmentGroupLabelAttrs(atom: Atom) {
  return atom instanceof AttachmentGroup ? { cursor: 'default' } : {};
}

export function drawAttachmentGroupHover(
  host: AttachmentGroupHoverHost,
  render: Render,
  drawOutline: boolean,
) {
  const hoversToCombine: any[] = [];
  const atomIds = new Set(host.a.atomIds);

  const selfPlate = host.makeHoverPlate(render, false);

  if (selfPlate) {
    selfPlate.attr({ cursor: 'default' });
    hoversToCombine.push(selfPlate);
  }

  host.a.atomIds.forEach((atomId) => {
    const atom = render.ctab.atoms.get(atomId);
    const atomPlate = atom?.makeHoverPlate(render, false);

    if (atomPlate) {
      hoversToCombine.push(atomPlate);
    }
  });

  render.ctab.bonds.forEach((rebond) => {
    if (atomIds.has(rebond.b.begin) && atomIds.has(rebond.b.end)) {
      const bondPlate = rebond.makeHoverPlate(render, false);

      if (bondPlate) {
        hoversToCombine.push(bondPlate);
      }
    }
  });

  const elements: SVGElement[] = [];

  hoversToCombine.forEach((item) => {
    if (item?.node) {
      elements.push(item.node);
      item.remove();
    }
  });

  paperjs.setup(document.createElement('canvas'));

  let combinedPath: any = null;

  elements.forEach((el) => {
    const paperPath = paperPathFromSVGElement(el);

    if (!paperPath) return;
    if (!paperPath.closed) paperPath.closePath();

    combinedPath = combinedPath ? combinedPath.unite(paperPath) : paperPath;
  });

  if (!combinedPath) return;

  const hoverPath = render.paper
    .path(combinedPath.pathData)
    .attr({ ...render.options.hoverStyle, cursor: 'default' });

  render.ctab.addReObjectPath(LayerMap.hovering, host.visel, hoverPath);
  host.attachHighlightTriggerForAttachmentPointAtom(hoverPath, render);
  host.drawHoverForPotentialAttachmentPointAtomsInMonomerCreationWizard(
    render,
    drawOutline,
  );

  return hoverPath;
}
