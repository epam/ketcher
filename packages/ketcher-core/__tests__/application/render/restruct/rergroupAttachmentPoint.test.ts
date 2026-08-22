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

/**
 * Fixture for the #3268 regression: atom at (0,0) with attachment point and
 * query properties (rb3;s2), two symmetric neighbors that force the bisect
 * direction to coincide with the AP direction (both go left, i.e. (−1, 0)).
 * A separate detached BothSides atom activates AP number rendering.
 * update() is NOT called inside the fixture so callers can install spies first.
 */
function createQueryPropertyFixture(renderOptions: RenderOptions) {
  const struct = new Struct();

  const attachedAtomId = struct.atoms.add(
    new Atom({
      label: 'C',
      pp: new Vec2(0, 0),
      attachmentPoints: AttachmentPoints.FirstSideOnly,
      ringBondCount: 3,
      substitutionCount: 2,
    }),
  );
  const upperNeighborId = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(1, 1) }),
  );
  const lowerNeighborId = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(1, -1) }),
  );

  const upperBond = new Bond({
    begin: attachedAtomId,
    end: upperNeighborId,
    type: Bond.PATTERN.TYPE.SINGLE,
  });
  const lowerBond = new Bond({
    begin: attachedAtomId,
    end: lowerNeighborId,
    type: Bond.PATTERN.TYPE.SINGLE,
  });
  const upperBondId = struct.bonds.add(upperBond);
  const lowerBondId = struct.bonds.add(lowerBond);

  struct.bondInitHalfBonds(upperBondId, upperBond);
  struct.bondInitHalfBonds(lowerBondId, lowerBond);
  struct.initNeighbors();
  struct.setImplicitHydrogen();

  struct.rgroupAttachmentPoints.add(
    new RGroupAttachmentPoint(attachedAtomId, 'primary'),
  );

  // Smallest detached setup atom that activates AP number rendering without
  // adding any neighbours to the main atom.
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

  // Intentionally not calling restruct.update(true) — callers install spies first.
  return { render, restruct };
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

  it('preserves nominal endpoint and number position; clamps extreme stem start to maintain a minimum visible stem', () => {
    // microModeScale=40, lineWidth=2 (=40/20).
    // nominalLength = 40*0.85 = 34 px.
    // minimumStemLength = OUTLINE_PADDING * microModeScale = 0.15*40 = 6 px.
    // maximumStartProjection = 34-6 = 28 px.
    const fixture = createTwoNeighborAttachmentPointFixture({
      ...options,
      microModeScale: 40,
    } as RenderOptions);
    const { render, reAtom, reAttachmentPoint } = fixture;

    // Case 1 – no label extent: stem start at the atom centre; all geometry
    // is at the nominal position.
    reAtom.visel.exts = [];
    const noShiftRender = captureAttachmentPointRender(fixture);
    // Direction is determined by the structural bisection, not the label.
    expectVec2CloseTo(reAttachmentPoint.lineDirectionVector, new Vec2(-1, 0));
    expectVec2CloseTo(noShiftRender.shape.directionVector, new Vec2(-1, 0));
    expectVec2CloseTo(noShiftRender.shape.shiftedStemStart, new Vec2(0, 0));
    expectVec2CloseTo(noShiftRender.shape.attachmentPointEnd, new Vec2(-34, 0));
    expectVec2CloseTo(noShiftRender.label.labelPosition, new Vec2(-28, -6.8));
    expect(noShiftRender.label.labelText).toBe('1');

    // Case 2 – moderate label: stem start shifts to (-16, 0) but stays within
    // maximumStartProjection=28; nominal endpoint and number are preserved.
    // Box2Abs((-10,-5),(8,5)) → shiftRayBox=10; atomSymbolShift=10;
    // return = 10+3*2=16, rawProjection=16 < 28 → no clamp.
    reAtom.visel.exts = [new Box2Abs(new Vec2(-10, -5), new Vec2(8, 5))];
    const moderateRender = captureAttachmentPointRender(fixture);
    expectVec2CloseTo(moderateRender.shape.shiftedStemStart, new Vec2(-16, 0));
    expectVec2CloseTo(
      moderateRender.shape.attachmentPointEnd,
      new Vec2(-34, 0),
    );
    expectVec2CloseTo(moderateRender.label.labelPosition, new Vec2(-28, -6.8));

    // Case 3 – extreme label: raw stem start would be at projection 66
    // (rawProjection=66 > 28), so it is clamped to maxStartProjection=28
    // → shiftedStemStart=(-28, 0).  Endpoint and number remain at their nominal
    // positions; the visible stem is exactly minimumStemLength=6 px.
    // Box2Abs((-60,-7),(18,7)) → shiftRayBox=60; atomSymbolShift=60;
    // return = 60+3*2=66.
    reAtom.visel.exts = [new Box2Abs(new Vec2(-60, -7), new Vec2(18, 7))];
    const wideRender = captureAttachmentPointRender(fixture);

    // Nominal endpoint is preserved (was incorrectly displaced to (-100,0) before fix).
    expectVec2CloseTo(wideRender.shape.attachmentPointEnd, new Vec2(-34, 0));
    // Number position is preserved (was incorrectly displaced to (-94,-6.8) before fix).
    expectVec2CloseTo(wideRender.label.labelPosition, new Vec2(-28, -6.8));
    expect(wideRender.label.labelText).toBe('1');
    // Stem start is clamped to maxStartProjection=28.
    expectVec2CloseTo(wideRender.shape.shiftedStemStart, new Vec2(-28, 0));
    // Direction is unaffected by the label width.
    expectVec2CloseTo(wideRender.shape.directionVector, new Vec2(-1, 0));

    // The clamped start is strictly before the nominal endpoint along the direction.
    const startProj = Vec2.dot(
      wideRender.shape.shiftedStemStart.sub(new Vec2(0, 0)),
      reAttachmentPoint.lineDirectionVector,
    );
    const endProj = Vec2.dot(
      wideRender.shape.attachmentPointEnd.sub(new Vec2(0, 0)),
      reAttachmentPoint.lineDirectionVector,
    );
    expect(startProj).toBeLessThan(endProj);

    // The visible stem is at least minimumStemLength = OUTLINE_PADDING * microModeScale = 6 px.
    const stemLength = Vec2.dot(
      wideRender.shape.attachmentPointEnd.sub(
        wideRender.shape.shiftedStemStart,
      ),
      reAttachmentPoint.lineDirectionVector,
    );
    expect(stemLength).toBeGreaterThanOrEqual(
      0.15 * render.options.microModeScale,
    );
  });

  it('displaces rb3;s2 query-property label laterally so it does not overlap the AP number', () => {
    // The main atom at (0,0) has FirstSideOnly AP and query properties
    // rb3;s2.  Two symmetric neighbors at (1,±1) make bisectLargestSector
    // return (−1,0), which is the same direction as the AP → without lateral
    // displacement the query label would land on the wave glyph.
    //
    // getBBox is mocked by mockSvgDomApi (returns {x:0,y:0,width:10,height:10}),
    // so the test validates rendered translateAbs offsets and AABB separation
    // logic under deterministic mocked dimensions, not real browser font geometry.
    const { render, restruct } = createQueryPropertyFixture(options);

    const apLabelSpy = jest.spyOn(draw, 'rgroupAttachmentPointLabel');
    const paperTextSpy = jest.spyOn(render.paper, 'text');

    restruct.update(true);

    // --- AP number ---
    // The AP number label is '1' (primary AP, BothSides atom present).
    const apLabelCallIdx = apLabelSpy.mock.calls.findIndex((c) => c[2] === '1');
    expect(apLabelCallIdx).toBeGreaterThanOrEqual(0);

    const apLabelPos = apLabelSpy.mock.calls[apLabelCallIdx][1] as Vec2;
    const apLabelEl = apLabelSpy.mock.results[apLabelCallIdx].value as {
      getBBox(): DOMRect;
      delta?: { x: number; y: number };
    };
    const apBb = apLabelEl.getBBox();
    const apDelta = apLabelEl.delta ?? { x: 0, y: 0 };
    const apRect = {
      left: apLabelPos.x + apDelta.x + apBb.x,
      right: apLabelPos.x + apDelta.x + apBb.x + apBb.width,
      top: apLabelPos.y + apDelta.y + apBb.y,
      bottom: apLabelPos.y + apDelta.y + apBb.y + apBb.height,
    };

    // --- Query-property aamPath ---
    // paper.text is called with the combined text; for this atom it is 'rb3;s2\n'.
    const aamCallIdx = paperTextSpy.mock.calls.findIndex(
      (c) => typeof c[2] === 'string' && (c[2] as string).includes('rb3'),
    );
    expect(aamCallIdx).toBeGreaterThanOrEqual(0);

    const aamInitX = paperTextSpy.mock.calls[aamCallIdx][0] as number;
    const aamInitY = paperTextSpy.mock.calls[aamCallIdx][1] as number;
    const aamEl = paperTextSpy.mock.results[aamCallIdx].value as {
      getBBox(): DOMRect;
      delta?: { x: number; y: number };
    };
    const aamBb = aamEl.getBBox();
    const aamDelta = aamEl.delta ?? { x: 0, y: 0 };
    const aamRect = {
      left: aamInitX + aamDelta.x + aamBb.x,
      right: aamInitX + aamDelta.x + aamBb.x + aamBb.width,
      top: aamInitY + aamDelta.y + aamBb.y,
      bottom: aamInitY + aamDelta.y + aamBb.y + aamBb.height,
    };

    // The laterally-displaced query label must not intersect the AP number.
    const separated =
      aamRect.right <= apRect.left ||
      aamRect.left >= apRect.right ||
      aamRect.bottom <= apRect.top ||
      aamRect.top >= apRect.bottom;

    expect(separated).toBe(true);

    apLabelSpy.mockRestore();
    paperTextSpy.mockRestore();
  });
});
