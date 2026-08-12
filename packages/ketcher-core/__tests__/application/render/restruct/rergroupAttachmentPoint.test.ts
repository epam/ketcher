import { Render, ReStruct } from 'application/render';
import draw from 'application/render/draw';
import type { RenderOptions } from 'application/render/render.types';
import { Box2Abs } from 'domain/entities/box2Abs';
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

function createTwoNeighborAttachmentPointFixture(renderOptions: RenderOptions) {
  const struct = new Struct();
  const attachedAtomId = struct.atoms.add(
    new Atom({
      label: 'C',
      pp: new Vec2(0, 0),
      attachmentPoints: AttachmentPoints.FirstSideOnly,
    }),
  );
  const upperNeighborAtomId = struct.atoms.add(
    new Atom({
      label: 'C',
      pp: new Vec2(1, 1),
    }),
  );
  const lowerNeighborAtomId = struct.atoms.add(
    new Atom({
      label: 'C',
      pp: new Vec2(1, -1),
    }),
  );

  const upperBond = new Bond({
    begin: attachedAtomId,
    end: upperNeighborAtomId,
    type: Bond.PATTERN.TYPE.SINGLE,
  });
  const lowerBond = new Bond({
    begin: attachedAtomId,
    end: lowerNeighborAtomId,
    type: Bond.PATTERN.TYPE.SINGLE,
  });
  const upperBondId = struct.bonds.add(upperBond);
  const lowerBondId = struct.bonds.add(lowerBond);

  struct.bondInitHalfBonds(upperBondId, upperBond);
  struct.bondInitHalfBonds(lowerBondId, lowerBond);
  struct.initNeighbors();
  struct.setImplicitHydrogen();

  const attachmentPointId = struct.rgroupAttachmentPoints.add(
    new RGroupAttachmentPoint(attachedAtomId, 'primary'),
  );

  // Attachment-point numbers are rendered only when the structure contains an
  // atom with a second-side or both-sides attachment-point flag.
  struct.atoms.add(
    new Atom({
      label: 'C',
      pp: new Vec2(5, 5),
      attachmentPoints: AttachmentPoints.BothSides,
    }),
  );

  const container = document.createElement('div');
  document.body.appendChild(container);

  const render = new Render(container, renderOptions);
  const restruct = new ReStruct(struct, render);

  restruct.update(true);

  const reAtom = restruct.atoms.get(attachedAtomId);
  const reAttachmentPoint =
    restruct.rgroupAttachmentPoints.get(attachmentPointId);

  expect(reAtom).toBeDefined();
  expect(reAttachmentPoint).toBeDefined();

  if (!reAtom || !reAttachmentPoint) {
    throw new Error('Test setup failed to create render objects');
  }

  return { render, restruct, reAtom, reAttachmentPoint, attachmentPointId };
}

function expectVec2CloseTo(actual: Vec2, expected: Vec2, precision = 6) {
  expect(actual.x).toBeCloseTo(expected.x, precision);
  expect(actual.y).toBeCloseTo(expected.y, precision);
}

function captureAttachmentPointRender({
  restruct,
  reAttachmentPoint,
  attachmentPointId,
}: ReturnType<typeof createTwoNeighborAttachmentPointFixture>) {
  const shapeSpy = jest.spyOn(draw, 'rgroupAttachmentPoint');
  const labelSpy = jest.spyOn(draw, 'rgroupAttachmentPointLabel');

  reAttachmentPoint.visel.clear();
  reAttachmentPoint.show(restruct, attachmentPointId);

  const shapeCall = shapeSpy.mock.calls[0];
  const labelCall = labelSpy.mock.calls[0];

  shapeSpy.mockRestore();
  labelSpy.mockRestore();

  if (!shapeCall || !labelCall) {
    throw new Error('Attachment point rendering was not captured');
  }

  return {
    shape: {
      shiftedStemStart: shapeCall[1],
      attachmentPointEnd: shapeCall[2],
      directionVector: shapeCall[3],
    },
    label: {
      labelPosition: labelCall[1],
      labelText: labelCall[2],
    },
  };
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

  it('preserves nominal geometry when the stem start does not reach the endpoint, and restores it when it does', () => {
    const fixture = createTwoNeighborAttachmentPointFixture({
      ...options,
      microModeScale: 40,
    } as RenderOptions);
    const { render, reAtom, reAttachmentPoint } = fixture;

    // Case 1 – no label extent: shiftedStemStart at the atom position; all
    // geometry is at the nominal position derived from the atom centre.
    reAtom.visel.exts = [];
    const noShiftRender = captureAttachmentPointRender(fixture);
    expectVec2CloseTo(reAttachmentPoint.lineDirectionVector, new Vec2(-1, 0));
    expectVec2CloseTo(noShiftRender.shape.shiftedStemStart, new Vec2(0, 0));
    expectVec2CloseTo(noShiftRender.shape.attachmentPointEnd, new Vec2(-34, 0));
    expectVec2CloseTo(noShiftRender.label.labelPosition, new Vec2(-28, -6.8));
    expect(noShiftRender.label.labelText).toBe('1');

    // Case 2 – moderate label extent: stem start shifts to (-16, 0) but has
    // not yet reached the nominal endpoint at (-34, 0); nominal geometry is
    // preserved exactly.
    // Box2Abs((-10,-5),(8,5)) → shiftRayBox = 10; with lineWidth=2 → shift=16.
    reAtom.visel.exts = [new Box2Abs(new Vec2(-10, -5), new Vec2(8, 5))];
    const moderateRender = captureAttachmentPointRender(fixture);
    expectVec2CloseTo(moderateRender.shape.shiftedStemStart, new Vec2(-16, 0));
    expectVec2CloseTo(
      moderateRender.shape.attachmentPointEnd,
      new Vec2(-34, 0),
    );
    expectVec2CloseTo(moderateRender.label.labelPosition, new Vec2(-28, -6.8));

    // Case 3 – wide label extent: stem start shifts to (-66, 0), past the
    // nominal endpoint; endpoint and number move outward to keep a valid stem.
    // Box2Abs((-60,-7),(18,7)) → shiftRayBox = 60; with lineWidth=2 → shift=66.
    reAtom.visel.exts = [new Box2Abs(new Vec2(-60, -7), new Vec2(18, 7))];
    const wideRender = captureAttachmentPointRender(fixture);
    expectVec2CloseTo(wideRender.shape.shiftedStemStart, new Vec2(-66, 0));
    expectVec2CloseTo(wideRender.shape.attachmentPointEnd, new Vec2(-100, 0));
    expectVec2CloseTo(wideRender.label.labelPosition, new Vec2(-94, -6.8));
    expect(wideRender.label.labelText).toBe('1');
    // The stem must remain outward with the full nominal length.
    expect(
      Vec2.dot(
        wideRender.shape.attachmentPointEnd.sub(
          wideRender.shape.shiftedStemStart,
        ),
        reAttachmentPoint.lineDirectionVector,
      ),
    ).toBeCloseTo(render.options.microModeScale * 0.85, 6);
  });
});
