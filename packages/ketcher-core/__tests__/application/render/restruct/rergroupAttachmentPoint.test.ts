import { Render, ReStruct } from 'application/render';
import { RenderOptions } from 'application/render/render.types';
import {
  AttachmentPoints,
  Atom,
  Bond,
  RGroupAttachmentPoint,
  Struct,
  Vec2,
} from 'domain/entities';

type SvgSvgElementWithRaphaelMethods = SVGSVGElement & {
  createSVGMatrix: () => DOMMatrix;
  createSVGPoint: () => DOMPoint;
};

function mockSvgDomApi() {
  const svgSvgElement = window.SVGSVGElement
    .prototype as unknown as SvgSvgElementWithRaphaelMethods;

  svgSvgElement.createSVGMatrix = () =>
    ({
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      e: 0,
      f: 0,
      inverse() {
        return this;
      },
      multiply() {
        return this;
      },
      translate() {
        return this;
      },
      scale() {
        return this;
      },
      rotate() {
        return this;
      },
    } as unknown as DOMMatrix);

  svgSvgElement.createSVGPoint = () =>
    ({
      x: 0,
      y: 0,
      matrixTransform() {
        return this;
      },
    } as unknown as DOMPoint);

  window.SVGElement.prototype.getBBox = () =>
    ({ x: 0, y: 0, width: 10, height: 10 } as DOMRect);
}

describe('ReRGroupAttachmentPoint', () => {
  const options = {
    microModeScale: 20,
    width: 100,
    height: 100,
  } as RenderOptions;

  beforeEach(() => {
    document.body.innerHTML = '';
    mockSvgDomApi();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('adds attachment point test attributes to rendered attachment points', () => {
    const struct = new Struct();
    const attachedAtomId = struct.atoms.add(
      new Atom({
        label: 'C',
        pp: new Vec2(0, 0),
        attachmentPoints: AttachmentPoints.BothSides,
      }),
    );
    const neighboringAtomId = struct.atoms.add(
      new Atom({
        label: 'C',
        pp: new Vec2(1, 0),
      }),
    );
    const bond = new Bond({
      begin: attachedAtomId,
      end: neighboringAtomId,
      type: Bond.PATTERN.TYPE.SINGLE,
    });
    const bondId = struct.bonds.add(bond);

    struct.bondInitHalfBonds(bondId, bond);
    struct.initNeighbors();
    struct.setImplicitHydrogen();

    struct.rgroupAttachmentPoints.add(
      new RGroupAttachmentPoint(attachedAtomId, 'primary'),
    );
    struct.rgroupAttachmentPoints.add(
      new RGroupAttachmentPoint(attachedAtomId, 'secondary'),
    );

    const container = document.createElement('div');
    document.body.appendChild(container);

    const render = new Render(container, options);
    const restruct = new ReStruct(struct, render);

    restruct.update(true);

    const atomElement = container.querySelector(
      `[data-testid="atom"][data-atom-id="${attachedAtomId}"]`,
    );
    const primaryAttachmentPoint = container.querySelector(
      '[data-testid="attachment-point"][data-primary-or-secondary="primary"]',
    );
    const secondaryAttachmentPoint = container.querySelector(
      '[data-testid="attachment-point"][data-primary-or-secondary="secondary"]',
    );

    expect(atomElement).not.toBeNull();
    expect(
      container.querySelectorAll('[data-testid="attachment-point"]'),
    ).toHaveLength(2);
    expect(primaryAttachmentPoint).not.toBeNull();
    expect(secondaryAttachmentPoint).not.toBeNull();
    expect(
      primaryAttachmentPoint?.getAttribute('data-attached-to-atomid'),
    ).toBe(atomElement?.getAttribute('data-atom-id'));
    expect(
      secondaryAttachmentPoint?.getAttribute('data-attached-to-atomid'),
    ).toBe(atomElement?.getAttribute('data-atom-id'));
  });
});
