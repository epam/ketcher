import {
  computeShiftSet,
  computeTriangleSideC,
  getExtendedBondLength,
  getPhosphatePresetRequiredBondLength,
  isBondInCycle,
  orderBondEnds,
  resolveMonomerInsertion,
  resolvePresetInsertion,
  type GraphEdge,
} from 'application/editor/libraryItemDragDrop/insertionHelpers';
import { AttachmentPointName } from 'domain/types';

const { R1, R2, R3 } = AttachmentPointName;

describe('phosphate preset bond extension', () => {
  it('uses A + B for a horizontal bond', () => {
    expect(computeTriangleSideC(0)).toBeCloseTo(2.25);
    expect(getPhosphatePresetRequiredBondLength(0)).toBeCloseTo(4.5);
  });

  it('satisfies the law of cosines for a 90° angle', () => {
    expect(computeTriangleSideC(Math.PI / 2)).toBeCloseTo(
      Math.sqrt(1.5 * 1.5 - 0.75 * 0.75),
    );
  });

  it('never shortens the bond and enforces 3 Å for plain monomers', () => {
    const from = { x: 0, y: 0 };
    expect(getExtendedBondLength(2, from, { x: 2, y: 0 }, false)).toBe(3);
    expect(getExtendedBondLength(5, from, { x: 5, y: 0 }, false)).toBe(5);
    expect(getExtendedBondLength(1, from, { x: 1, y: 0 }, true)).toBeCloseTo(
      4.5,
    );
    expect(getExtendedBondLength(6, from, { x: 6, y: 0 }, true)).toBe(6);
  });
});

describe('graph helpers', () => {
  const chain: GraphEdge[] = [
    [1, 2],
    [2, 3],
    [3, 4],
  ];
  const ring: GraphEdge[] = [...chain, [4, 1]];

  it('detects cycles', () => {
    expect(isBondInCycle([2, 3], chain)).toBe(false);
    expect(isBondInCycle([2, 3], ring)).toBe(true);
  });

  it('orders bond ends right/bottom', () => {
    const [l, r] = orderBondEnds({ x: 5, y: 0 }, { x: 1, y: 0 });
    expect(l.x).toBe(1);
    expect(r.x).toBe(5);
    const [t, b] = orderBondEnds({ x: 0, y: 4 }, { x: 0, y: 1 });
    expect(t.y).toBe(1);
    expect(b.y).toBe(4);
  });

  it('shift set in a linear chain is the right part', () => {
    const nodes = [1, 2, 3, 4].map((id) => ({
      id,
      position: { x: id, y: 0 },
    }));
    const set = computeShiftSet({
      bond: [2, 3],
      leftTopId: 2,
      rightBottomId: 3,
      nodes,
      edges: chain,
    });
    expect([...set].sort()).toEqual([3, 4]);
  });

  it('shift set in a ring uses the perpendicular line', () => {
    const nodes = [
      { id: 1, position: { x: 0, y: 0 } },
      { id: 2, position: { x: 3, y: 0 } },
      { id: 3, position: { x: 6, y: 0 } },
      { id: 4, position: { x: 3, y: 3 } },
    ];
    const set = computeShiftSet({
      bond: [2, 3],
      leftTopId: 2,
      rightBottomId: 3,
      nodes,
      edges: ring,
    });
    expect(set.has(3)).toBe(true);
    expect(set.has(2)).toBe(false);
    expect(set.has(1)).toBe(false);
    expect(set.has(4)).toBe(false);
  });
});

describe('resolveMonomerInsertion', () => {
  const other = 'other' as const;

  it('amino acid between amino acids: R2(left)-R1(new), R2(new)-R1(right)', () => {
    const result = resolveMonomerInsertion({
      left: { kind: other, ap: R2 },
      right: { kind: other, ap: R1 },
      newMonomer: { kind: other, attachmentPoints: [R1, R2] },
    });
    expect(result).toEqual({
      status: 'resolved',
      kind: 'monomer',
      leftAp: R1,
      rightAp: R2,
    });
  });

  it('flipped bond R1(left)-R2(right) uses new R2 on the left', () => {
    const result = resolveMonomerInsertion({
      left: { kind: other, ap: R1 },
      right: { kind: other, ap: R2 },
      newMonomer: { kind: other, attachmentPoints: [R1, R2] },
    });
    expect(result).toMatchObject({
      status: 'resolved',
      leftAp: R2,
      rightAp: R1,
    });
  });

  it('sugar between base... uses R3-R1 for sugar/base', () => {
    const result = resolveMonomerInsertion({
      left: { kind: 'base', ap: R1 },
      right: { kind: other, ap: R1 },
      newMonomer: { kind: 'sugar', attachmentPoints: [R1, R2, R3] },
    });
    expect(result).toMatchObject({
      status: 'resolved',
      leftAp: R3,
      rightAp: R2,
    });
  });

  it('single-AP monomer fails with the single-AP error', () => {
    expect(
      resolveMonomerInsertion({
        left: { kind: other, ap: R2 },
        right: { kind: other, ap: R1 },
        newMonomer: { kind: other, attachmentPoints: [R1] },
      }),
    ).toEqual({
      status: 'failed',
      kind: 'monomer',
      failure: 'single-ap-error',
    });
  });

  it('missing partner AP opens the dialog', () => {
    expect(
      resolveMonomerInsertion({
        left: { kind: other, ap: R2 },
        right: { kind: other, ap: R1 },
        newMonomer: { kind: other, attachmentPoints: [R1, R3] },
      }),
    ).toEqual({ status: 'failed', kind: 'monomer', failure: 'dialog' });
  });

  it('non R1/R2 original AP has no default', () => {
    expect(
      resolveMonomerInsertion({
        left: { kind: other, ap: R3 },
        right: { kind: other, ap: R1 },
        newMonomer: { kind: other, attachmentPoints: [R1, R2, R3] },
      }),
    ).toMatchObject({ status: 'failed', failure: 'dialog' });
  });
});

describe('resolvePresetInsertion', () => {
  const other = 'other' as const;

  it('original R2(left)-R1(right) with a 5′ phosphate: phosphate left, sugar right', () => {
    expect(
      resolvePresetInsertion({
        left: { kind: other, ap: R2 },
        right: { kind: other, ap: R1 },
        hasPhosphate: true,
        phosphatePosition: 'left',
      }),
    ).toEqual({
      status: 'resolved',
      kind: 'preset',
      leftComponent: 'phosphate',
      leftAp: R1,
      rightComponent: 'sugar',
      rightAp: R2,
      flipped: false,
    });
  });

  it('5′ phosphate preset on R1(C)-R2(D): flipped, sugar next to C', () => {
    expect(
      resolvePresetInsertion({
        left: { kind: other, ap: R1 },
        right: { kind: other, ap: R2 },
        hasPhosphate: true,
        phosphatePosition: 'left',
      }),
    ).toMatchObject({
      status: 'resolved',
      leftComponent: 'sugar',
      leftAp: R2,
      rightComponent: 'phosphate',
      rightAp: R1,
      flipped: true,
    });
  });

  it('original R1(C)-R2(D): bonds R1(C)-R2(P) and R1(R)-R2(D)', () => {
    expect(
      resolvePresetInsertion({
        left: { kind: other, ap: R1 },
        right: { kind: other, ap: R2 },
        hasPhosphate: true,
        phosphatePosition: 'right',
      }),
    ).toMatchObject({
      status: 'resolved',
      leftComponent: 'phosphate',
      leftAp: R2,
      rightComponent: 'sugar',
      rightAp: R1,
      flipped: true,
    });
  });

  it('phosphateless preset uses the sugar on both sides', () => {
    expect(
      resolvePresetInsertion({
        left: { kind: other, ap: R2 },
        right: { kind: other, ap: R1 },
        hasPhosphate: false,
      }),
    ).toMatchObject({ leftComponent: 'sugar', rightComponent: 'sugar' });
  });

  it('same-named original APs cannot be resolved', () => {
    expect(
      resolvePresetInsertion({
        left: { kind: other, ap: R2 },
        right: { kind: other, ap: R2 },
        hasPhosphate: true,
      }),
    ).toEqual({ status: 'failed', kind: 'preset', failure: 'preset-error' });
  });
});
