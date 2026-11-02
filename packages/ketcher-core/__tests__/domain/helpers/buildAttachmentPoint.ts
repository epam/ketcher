import { select } from 'd3';
import 'application/editor';
import { setEditorInstance } from 'application/editor/editorSingleton';
import type { CoreEditor } from 'application/editor/Editor';
import type { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import type { SnakeModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/SnakeModePolymerBondRenderer';
import type { D3SvgElementSelection } from 'application/render/types';
import { UsageInMacromolecule } from 'application/render';
import { AttachmentPoint } from 'domain/AttachmentPoint';
import { PreviewAttachmentPoint } from 'domain/PreviewAttachmentPoint';
import { Peptide } from 'domain/entities/Peptide';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { Vec2 } from 'domain/entities/vec2';
import { AttachmentPointName } from 'domain/types';
import { peptideMonomerItem } from '../../mock-data';

// The monomer body is a box of this size around the center of the monomer renderer.
export const BODY_WIDTH = 60;
export const BODY_HEIGHT = 40;
export const MONOMER_CENTER = { x: 100, y: 100 };

export interface BondOverride {
  // true: the monomer under test is the first monomer of the bond
  isFirstMonomer: boolean;
  // attachment point of the other monomer that holds the bond
  otherAttachmentPointName: AttachmentPointName;
  // model position of the other monomer
  otherPosition: Vec2;
  // what the bond renderer answers to getSideConnectionEndpointAngle
  sideConnectionEndpointAngle?: number;
}

export interface AttachmentPointOverrides {
  modeName?: string;
  attachmentPointName?: AttachmentPointName;
  angle?: number;
  isSnake?: boolean;
  isUsed?: boolean;
  isDragTarget?: boolean;
  isDragCircleHover?: boolean;
  applyZoomForPositionCalculation?: boolean;
  bond?: BondOverride;
}

export interface PreviewAttachmentPointOverrides extends AttachmentPointOverrides {
  selected?: boolean;
  connected?: boolean;
  usage?: UsageInMacromolecule;
}

const monomerBodyNode = document.createElementNS(
  'http://www.w3.org/2000/svg',
  'rect',
);

// jsdom has no elementsFromPoint: a point inside the monomer box hits the body.
export function installMonomerHitTest() {
  Object.defineProperty(document, 'elementsFromPoint', {
    configurable: true,
    writable: true,
    value: jest.fn((x: number, y: number) =>
      Math.abs(x - MONOMER_CENTER.x) <= BODY_WIDTH / 2 &&
      Math.abs(y - MONOMER_CENTER.y) <= BODY_HEIGHT / 2
        ? [monomerBodyNode]
        : [],
    ),
  });
}

export function uninstallMonomerHitTest() {
  Reflect.deleteProperty(document, 'elementsFromPoint');
}

function buildMonomer(
  attachmentPointName: AttachmentPointName,
  bondOverride: BondOverride | undefined,
) {
  const monomer = new Peptide(peptideMonomerItem, new Vec2(0, 0));
  const bondRendererStub = {
    getSideConnectionEndpointAngle: jest.fn(
      () => bondOverride?.sideConnectionEndpointAngle,
    ),
  };

  monomer.renderer = {
    center: new Vec2(MONOMER_CENTER.x, MONOMER_CENTER.y),
    bodyElement: { node: () => monomerBodyNode },
  } as unknown as BaseMonomerRenderer;

  if (bondOverride) {
    const other = new Peptide(peptideMonomerItem, bondOverride.otherPosition);
    const bond = bondOverride.isFirstMonomer
      ? new PolymerBond(monomer, other)
      : new PolymerBond(other, monomer);

    monomer.setBond(attachmentPointName, bond);
    other.setBond(bondOverride.otherAttachmentPointName, bond);
    bond.moveToLinkedEntities();
    bond.renderer = bondRendererStub as unknown as SnakeModePolymerBondRenderer;
  }

  return { monomer, bondRendererStub };
}

function buildSharedParams(overrides: AttachmentPointOverrides) {
  const attachmentPointName =
    overrides.attachmentPointName ?? AttachmentPointName.R1;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  document.body.appendChild(svg);
  const canvas = select(svg) as unknown as D3SvgElementSelection<
    SVGSVGElement,
    void
  >;
  const rootElement = canvas.append('g') as D3SvgElementSelection<
    SVGGElement,
    void
  >;
  const { monomer, bondRendererStub } = buildMonomer(
    attachmentPointName,
    overrides.bond,
  );

  setEditorInstance({
    mode: { modeName: overrides.modeName ?? 'flex-mode' },
  } as unknown as CoreEditor);

  const params = {
    rootElement,
    monomer,
    bodyWidth: BODY_WIDTH,
    bodyHeight: BODY_HEIGHT,
    canvas,
    attachmentPointName,
    isUsed: overrides.isUsed ?? false,
    isPotentiallyUsed: false,
    angle: overrides.angle ?? 0,
    isSnake: overrides.isSnake ?? false,
    applyZoomForPositionCalculation:
      overrides.applyZoomForPositionCalculation ?? false,
    isDragTarget: overrides.isDragTarget,
    isDragCircleHover: overrides.isDragCircleHover,
  };

  return { svg, rootElement, monomer, bondRendererStub, params };
}

// The only place of the pin that calls `new AttachmentPoint(...)`.
export function buildAttachmentPoint(overrides: AttachmentPointOverrides = {}) {
  const { params, ...built } = buildSharedParams(overrides);
  const attachmentPoint = new AttachmentPoint(params);

  return { attachmentPoint, ...built };
}

// The only place of the pin that calls `new PreviewAttachmentPoint(...)`.
export function buildPreviewAttachmentPoint(
  overrides: PreviewAttachmentPointOverrides = {},
) {
  const { params, ...built } = buildSharedParams(overrides);
  const attachmentPoint = new PreviewAttachmentPoint({
    ...params,
    selected: overrides.selected ?? false,
    connected: overrides.connected ?? false,
    usage: overrides.usage ?? UsageInMacromolecule.MonomerPreview,
  });

  return { attachmentPoint, ...built };
}

export interface RenderedGeometry {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cx: number;
  cy: number;
  // direction of the drawn line, border point to attachment point, in degrees
  directionDegrees: number;
}

function numberAttr(element: Element | null, name: string) {
  return Number(element?.getAttribute(name));
}

// Reads the output of AttachmentPoint (not PreviewAttachmentPoint) from the DOM.
export function readGeometry(rootElement: SVGElement): RenderedGeometry {
  const line = rootElement.querySelector('line');
  const circle = rootElement.querySelector('circle');
  const x1 = numberAttr(line, 'x1');
  const y1 = numberAttr(line, 'y1');
  const x2 = numberAttr(line, 'x2');
  const y2 = numberAttr(line, 'y2');

  return {
    x1,
    y1,
    x2,
    y2,
    cx: numberAttr(circle, 'cx'),
    cy: numberAttr(circle, 'cy'),
    directionDegrees: Vec2.radiansToDegrees(Math.atan2(y2 - y1, x2 - x1)),
  };
}

// Compares angles on a circle: -180 and 180 are the same direction.
export function expectDirection(actual: number, expected: number) {
  const diff = Math.abs(((((actual - expected) % 360) + 540) % 360) - 180);
  expect(diff).toBeCloseTo(0, 5);
}
