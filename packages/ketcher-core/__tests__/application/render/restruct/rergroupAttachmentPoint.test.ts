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

  it('keeps ordinary geometry unchanged and moves the rendered glyph outward when a wide atom-property label shifts the stem start', () => {
    const wideLabelOptions = {
      ...options,
      microModeScale: 40,
    } as RenderOptions;
    const fixture = createTwoNeighborAttachmentPointFixture(wideLabelOptions);
    const { render, reAtom, reAttachmentPoint } = fixture;
    const ordinaryRender = captureAttachmentPointRender(fixture);
    reAtom.visel.exts = [new Box2Abs(new Vec2(-60, -7), new Vec2(18, 7))];
    const shiftedRender = captureAttachmentPointRender(fixture);

    expectVec2CloseTo(reAttachmentPoint.lineDirectionVector, new Vec2(-1, 0));
    expectVec2CloseTo(ordinaryRender.shape.directionVector, new Vec2(-1, 0));
    expectVec2CloseTo(ordinaryRender.shape.shiftedStemStart, new Vec2(0, 0));
    expectVec2CloseTo(
      ordinaryRender.shape.attachmentPointEnd,
      new Vec2(-34, 0),
    );
    expectVec2CloseTo(ordinaryRender.label.labelPosition, new Vec2(-28, -6.8));
    expect(ordinaryRender.label.labelText).toBe('1');
    expectVec2CloseTo(shiftedRender.shape.directionVector, new Vec2(-1, 0));
    expectVec2CloseTo(shiftedRender.shape.shiftedStemStart, new Vec2(-66, 0));
    expectVec2CloseTo(
      shiftedRender.shape.attachmentPointEnd,
      new Vec2(-100, 0),
    );
    expectVec2CloseTo(shiftedRender.label.labelPosition, new Vec2(-94, -6.8));
    expect(shiftedRender.label.labelText).toBe('1');
    expectVec2CloseTo(
      shiftedRender.label.labelPosition.sub(ordinaryRender.label.labelPosition),
      shiftedRender.shape.shiftedStemStart.sub(
        ordinaryRender.shape.shiftedStemStart,
      ),
    );
    expect(
      Vec2.dot(
        shiftedRender.shape.attachmentPointEnd.sub(
          shiftedRender.shape.shiftedStemStart,
        ),
        reAttachmentPoint.lineDirectionVector,
      ),
    ).toBeCloseTo(render.options.microModeScale * 0.85, 6);
    expect(
      Vec2.dot(
        shiftedRender.label.labelPosition.sub(
          shiftedRender.shape.shiftedStemStart,
        ),
        reAttachmentPoint.lineDirectionVector,
      ),
    ).toBeGreaterThan(0);
    expect(
      Vec2.dot(
        shiftedRender.shape.attachmentPointEnd.sub(
          shiftedRender.label.labelPosition,
        ),
        reAttachmentPoint.lineDirectionVector,
      ),
    ).toBeGreaterThan(0);
    expect(
      Vec2.dot(
        shiftedRender.shape.shiftedStemStart.sub(
          ordinaryRender.shape.attachmentPointEnd,
        ),
        reAttachmentPoint.lineDirectionVector,
      ),
    ).toBeGreaterThan(0);
  });
});
