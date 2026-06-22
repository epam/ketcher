import type { Atom } from 'domain/entities/atom';
import { isSuperAttachmentPointAtom } from 'domain/helpers/hapticBond';
import { LayerMap } from './generalEnumTypes';
import { paperPathFromSVGElement } from './resgroup';
import type { Render } from '../raphaelRender';
import type Visel from './visel';
import paperjs from 'paper';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface SuperAttachmentPointHoverHost {
  a: Atom;
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

export function getSuperAttachmentPointLabelAttrs(
  atom: Pick<Atom, 'label' | 'endpoints'>,
) {
  return isSuperAttachmentPointAtom(atom) ? { cursor: 'default' } : {};
}

export function drawSuperAttachmentPointHover(
  host: SuperAttachmentPointHoverHost,
  render: Render,
  drawOutline: boolean,
) {
  const hoversToCombine: any[] = [];
  const endpointIds = new Set(host.a.endpoints);

  const selfPlate = host.makeHoverPlate(render, false);

  if (selfPlate) {
    selfPlate.attr({ cursor: 'default' });
    hoversToCombine.push(selfPlate);
  }

  host.a.endpoints.forEach((atomId) => {
    const endpointAtom = render.ctab.atoms.get(atomId);
    const atomPlate = endpointAtom?.makeHoverPlate(render, false);

    if (atomPlate) {
      hoversToCombine.push(atomPlate);
    }
  });

  render.ctab.bonds.forEach((rebond) => {
    if (endpointIds.has(rebond.b.begin) && endpointIds.has(rebond.b.end)) {
      const bondPlate = rebond.makeHoverPlate(render, false);

      if (bondPlate) {
        hoversToCombine.push(bondPlate);
      }
    }
  });

  const elements: Element[] = [];

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

    if (!paperPath) {
      return;
    }

    if (!paperPath.closed) {
      paperPath.closePath();
    }

    if (!combinedPath) {
      combinedPath = paperPath;
    } else {
      combinedPath = combinedPath.unite(paperPath);
    }
  });

  if (!combinedPath) {
    return;
  }

  const combinedPathD = combinedPath.pathData;
  const hoverPath = render.paper
    .path(combinedPathD)
    .attr({ ...render.options.hoverStyle, cursor: 'default' });

  render.ctab.addReObjectPath(LayerMap.hovering, host.visel, hoverPath);
  host.attachHighlightTriggerForAttachmentPointAtom(hoverPath, render);
  host.drawHoverForPotentialAttachmentPointAtomsInMonomerCreationWizard(
    render,
    drawOutline,
  );

  return hoverPath;
}
