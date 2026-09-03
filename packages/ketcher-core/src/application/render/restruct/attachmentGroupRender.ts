import { AttachmentGroup } from 'domain/entities/attachmentGroup';
import { Vec2 } from 'domain/entities/vec2';
import { Scale } from 'domain/helpers';
import { LayerMap } from './generalEnumTypes';
import { paperPathFromSVGElement } from './resgroup';
import type { Render } from '../raphaelRender';
import type Visel from './visel';
import type { RaphaelSet } from 'raphael';
import paperjs from 'paper';

/* eslint-disable @typescript-eslint/no-explicit-any */

const ATTACHMENT_GROUP_MARKER_VIEWBOX_SIZE = 43;
const ATTACHMENT_GROUP_MARKER_COLOR = '#B4B9D6';
const ATTACHMENT_GROUP_MARKER_HOVER_COLOR = '#0097A8';

export interface AttachmentGroupHoverHost {
  a: AttachmentGroup;
  visel: Visel;
}

export type AttachmentGroupMarkerState = 'default' | 'centerHovered';

function getMarkerScale(render: Render, viewBoxSize: number) {
  return (render.options.atomSelectionPlateRadius * 2) / viewBoxSize;
}

function drawDefaultMarker(render: Render, center: Vec2): RaphaelSet {
  const scale = getMarkerScale(render, ATTACHMENT_GROUP_MARKER_VIEWBOX_SIZE);
  const backgroundRadius = 20.5 * scale;
  const innerRadius = 6.5 * scale;
  const innerArm = 3.5 * scale;
  const outerArm = 11.5 * scale;
  const strokeWidth = 1.4 * scale;
  const marker = render.paper.set();
  const background = render.paper
    .circle(center.x, center.y, backgroundRadius)
    .attr({
      fill: '#FFFFFF',
      stroke: 'none',
      cursor: 'default',
    });
  const cross = render.paper
    .path(
      [
        `M${center.x - outerArm},${center.y}`,
        `H${center.x - innerArm}`,
        `M${center.x + innerArm},${center.y}`,
        `H${center.x + outerArm}`,
        `M${center.x},${center.y - outerArm}`,
        `V${center.y - innerArm}`,
        `M${center.x},${center.y + innerArm}`,
        `V${center.y + outerArm}`,
      ].join(' '),
    )
    .attr({
      fill: 'none',
      stroke: ATTACHMENT_GROUP_MARKER_COLOR,
      'stroke-width': strokeWidth,
      'stroke-linecap': 'round',
      cursor: 'default',
    });
  const circle = render.paper.circle(center.x, center.y, innerRadius).attr({
    fill: 'none',
    stroke: ATTACHMENT_GROUP_MARKER_COLOR,
    'stroke-width': strokeWidth,
    cursor: 'default',
  });

  marker.push(background, cross, circle);
  return marker;
}

function drawCenterHoveredMarker(render: Render, center: Vec2): RaphaelSet {
  const scale = getMarkerScale(render, ATTACHMENT_GROUP_MARKER_VIEWBOX_SIZE);
  const innerRadius = 6.5 * scale;
  const outerRadius = 20.5 * scale;
  const strokeWidth = 2 * scale;
  const marker = render.paper.set();
  const outerCircle = render.paper
    .circle(center.x, center.y, outerRadius)
    .attr({
      fill: '#FFFFFF',
      stroke: ATTACHMENT_GROUP_MARKER_HOVER_COLOR,
      'stroke-width': strokeWidth,
      cursor: 'default',
    });
  const innerCircle = render.paper
    .circle(center.x, center.y, innerRadius)
    .attr({
      fill: 'none',
      stroke: ATTACHMENT_GROUP_MARKER_HOVER_COLOR,
      'stroke-width': strokeWidth,
      cursor: 'default',
    });
  const innerCross = render.paper
    .path(
      [
        `M${center.x - innerRadius},${center.y}`,
        `H${center.x + innerRadius}`,
        `M${center.x},${center.y - innerRadius}`,
        `V${center.y + innerRadius}`,
      ].join(' '),
    )
    .attr({
      fill: 'none',
      stroke: ATTACHMENT_GROUP_MARKER_HOVER_COLOR,
      'stroke-width': strokeWidth,
      'stroke-linecap': 'round',
      cursor: 'default',
    });

  marker.push(outerCircle, innerCircle, innerCross);
  return marker;
}

export function drawAttachmentGroupMarker(
  render: Render,
  position: Vec2,
  state: AttachmentGroupMarkerState,
): RaphaelSet {
  const center = Scale.modelToCanvas(position, render.options);
  const marker =
    state === 'centerHovered'
      ? drawCenterHoveredMarker(render, center)
      : drawDefaultMarker(render, center);

  marker.forEach((element) => {
    element.node?.setAttribute('data-attachment-group-marker-state', state);
  });

  return marker;
}

function drawGroupAtomsHover(
  host: AttachmentGroupHoverHost,
  render: Render,
  drawOutline: boolean,
) {
  const hoversToCombine: any[] = [];
  const atomIds = new Set(host.a.atomIds);

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

  if (elements.length === 0) return null;

  paperjs.setup(document.createElement('canvas'));

  let combinedPath: any = null;

  elements.forEach((el) => {
    const paperPath = paperPathFromSVGElement(el);

    if (!paperPath) return;
    if (!paperPath.closed) paperPath.closePath();

    combinedPath = combinedPath ? combinedPath.unite(paperPath) : paperPath;
  });

  if (!combinedPath) return null;

  const hoverPath = render.paper.path(combinedPath.pathData).attr({
    ...render.options.hoverStyle,
    fill: 'none',
    stroke: drawOutline ? render.options.hoverStyle.stroke : 'none',
    cursor: 'default',
  });

  render.ctab.addReObjectPath(LayerMap.hovering, host.visel, hoverPath);
  return hoverPath;
}

export function drawAttachmentGroupHover(
  host: AttachmentGroupHoverHost,
  render: Render,
  drawOutline: boolean,
  showMarker: boolean,
) {
  const groupAtomsHover = drawGroupAtomsHover(host, render, drawOutline);
  if (!showMarker) {
    return groupAtomsHover;
  }

  const marker = drawAttachmentGroupMarker(render, host.a.pp, 'centerHovered');

  marker.forEach((element) => {
    render.ctab.addReObjectPath(LayerMap.data, host.visel, element);
  });
  return groupAtomsHover ?? marker;
}
