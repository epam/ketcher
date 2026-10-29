import { keepBondVisible } from 'application/render/restruct/rebond';
import type { RenderOptions } from 'application/render/render.types';
import type { HalfBond } from 'domain/entities/halfBond';
import { Vec2 } from 'domain/entities/vec2';

const options = { microModeScale: 1, lineWidth: 1 } as unknown as RenderOptions;
const BOND_LEN = 40;

function halfBonds(shift1: number, shift2: number) {
  const hb1 = { dir: new Vec2(1, 0), p: new Vec2(shift1, 0) } as HalfBond;
  const hb2 = {
    dir: new Vec2(-1, 0),
    p: new Vec2(BOND_LEN - shift2, 0),
  } as HalfBond;
  return { hb1, hb2 };
}

const run = (shift1: number, shift2: number) => {
  const { hb1, hb2 } = halfBonds(shift1, shift2);
  keepBondVisible(
    hb1,
    hb2,
    new Vec2(0, 0),
    new Vec2(BOND_LEN, 0),
    BOND_LEN,
    options,
  );
  return { start: hb1.p.x, end: hb2.p.x };
};

describe('keepBondVisible', () => {
  // Issue #12527: "CH2" needs 24px at one end, the other end needs 8px.
  it('keeps a wide label trim when the other end leaves room', () => {
    expect(run(24, 8)).toEqual({ start: 24, end: 32 });
  });

  // Issue #3508: two wide labels must not cross the bond ends.
  it('scales both trims back when they would leave no bond', () => {
    const { start, end } = run(30, 30);
    expect(end).toBeGreaterThan(start);
  });
});
