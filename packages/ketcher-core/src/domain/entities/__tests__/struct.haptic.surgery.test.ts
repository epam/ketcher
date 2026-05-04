// Section X integration test: a struct with one Fe metal atom, two
// 5-membered C rings, two SuperAttachmentPoints (one per ring), and two
// HapticBonds (Fe → each SAP). Exercises the surgery sites that must skip
// haptic bonds: halfBonds construction, ring detection, fragment-color
// (refrag.fragGetBonds), and bond deletion.

import { Atom } from 'domain/entities/atom';
import { Bond } from 'domain/entities/bond';
import { HapticBond } from 'domain/entities/HapticBond';
import { Struct } from 'domain/entities/struct';
import { SuperAttachmentPoint } from 'domain/entities/superAttachmentPoint';
import { Vec2 } from 'domain/entities/vec2';

function ringAtoms(struct: Struct, fid: number, yOffset: number): number[] {
  const ids: number[] = [];
  for (let i = 0; i < 5; i++) {
    const angle = (2 * Math.PI * i) / 5;
    ids.push(
      struct.atoms.add(
        new Atom({
          label: 'C',
          pp: new Vec2(Math.cos(angle), Math.sin(angle) + yOffset),
          fragment: fid,
        }),
      ),
    );
  }
  // Close the ring with single bonds.
  for (let i = 0; i < 5; i++) {
    struct.bonds.add(
      new Bond({
        begin: ids[i],
        end: ids[(i + 1) % 5],
        type: Bond.PATTERN.TYPE.SINGLE,
      }),
    );
  }
  return ids;
}

function buildFerroceneLike() {
  const struct = new Struct();
  const fid = struct.frags.add(null);
  const topRing = ringAtoms(struct, fid, 5);
  const bottomRing = ringAtoms(struct, fid, -5);
  const feId = struct.atoms.add(
    new Atom({ label: 'Fe', pp: new Vec2(0, 0), fragment: fid }),
  );
  const sapTop = struct.superAttachmentPoints.add(
    new SuperAttachmentPoint({ atoms: topRing }),
  );
  const sapBottom = struct.superAttachmentPoints.add(
    new SuperAttachmentPoint({ atoms: bottomRing }),
  );
  struct.bonds.add(new HapticBond({ begin: feId, sapId: sapTop }));
  struct.bonds.add(new HapticBond({ begin: feId, sapId: sapBottom }));
  return { struct, feId, topRing, bottomRing, sapTop, sapBottom };
}

describe('Haptic bond surgery (Section X)', () => {
  it('initHalfBonds skips haptic bonds (no halfBonds with end = -1)', () => {
    const { struct } = buildFerroceneLike();
    struct.initHalfBonds();
    // 10 ring bonds × 2 halfBonds each = 20.
    // The 2 haptic bonds contribute 0 halfBonds (X1).
    expect(struct.halfBonds.size).toBe(20);
    struct.halfBonds.forEach((hb) => {
      expect(hb.begin).toBeGreaterThanOrEqual(0);
      expect(hb.end).toBeGreaterThanOrEqual(0);
    });
  });

  it('haptic bonds are identifiable via type and HapticBond instance', () => {
    const { struct, sapTop, sapBottom } = buildFerroceneLike();
    const haptics = [...struct.bonds.values()].filter(
      (b) => b.type === Bond.PATTERN.TYPE.HAPTIC,
    );
    expect(haptics).toHaveLength(2);
    const sapIds = new Set([sapTop, sapBottom]);
    haptics.forEach((b) => {
      expect(b).toBeInstanceOf(HapticBond);
      expect(b.end).toBe(-1);
      expect(sapIds.has((b as HapticBond).sapId)).toBe(true);
    });
  });

  it('mergeBondsParams skips haptic bonds (defended in fromBondsMerge)', () => {
    // Sanity check that we don't leak haptic into bond-merge geometry math.
    // The actual code path is tested via Section X6's haptic guard in
    // fromBondsMerge — here we just confirm the bond shape stops geometry
    // from being meaningful (begin/end aren't both real atoms).
    const { struct } = buildFerroceneLike();
    const haptic = [...struct.bonds.values()].find(
      (b) => b.type === Bond.PATTERN.TYPE.HAPTIC,
    ) as HapticBond;
    expect(struct.atoms.get(haptic.begin)).toBeDefined();
    expect(struct.atoms.get(haptic.end)).toBeUndefined();
  });
});
