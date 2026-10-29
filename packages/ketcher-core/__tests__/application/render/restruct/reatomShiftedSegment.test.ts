import ReAtom from 'application/render/restruct/reatom';
import type { RenderOptions } from 'application/render/render.types';
import { Atom, Vec2 } from 'domain/entities';
import { Box2Abs } from 'domain/entities/box2Abs';

const options = {
  microModeScale: 1,
  lineWidth: 1,
  fontszsubInPx: 13,
  showCharge: true,
} as unknown as RenderOptions;

// Measured in the app (issue #12527): at 100% zoom a "CH2" label reaches
// 20.8px to the right of the atom centre, and a bond is 40px long.
const BOND_LEN = 40;
const CH2_RIGHT_EDGE = 21;

describe('ReAtom.getShiftedSegmentPosition', () => {
  it('starts the bond outside a label that is wider than half the bond', () => {
    const reatom = new ReAtom(new Atom({ label: 'C', pp: new Vec2(0, 0, 0) }));
    reatom.visel.exts.push(new Box2Abs(-4.7, -7.5, CH2_RIGHT_EDGE, 7.5));

    const start = reatom.getShiftedSegmentPosition(
      options,
      new Vec2(1, 0),
      new Vec2(0, 0),
      BOND_LEN,
    );

    expect(start.x).toBeGreaterThanOrEqual(CH2_RIGHT_EDGE);
  });
});
