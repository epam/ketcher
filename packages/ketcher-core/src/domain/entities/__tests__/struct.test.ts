import { Atom } from 'domain/entities/atom';
import { Bond } from 'domain/entities/bond';
import { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';

describe('Struct.rescale() scale-sanity guard', () => {
  function makeStructWithBondLength(length: number): Struct {
    const s = new Struct();
    const a1 = s.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
    const a2 = s.atoms.add(new Atom({ label: 'C', pp: new Vec2(length, 0) }));
    s.bonds.add(
      new Bond({ begin: a1, end: a2, type: Bond.PATTERN.TYPE.SINGLE }),
    );
    return s;
  }

  it('rescales normally for typical bond length (1.5 → result ≈ 1)', () => {
    const s = makeStructWithBondLength(1.5);
    s.rescale();
    const finalLength = Vec2.dist(s.atoms.get(0)!.pp, s.atoms.get(1)!.pp);
    expect(finalLength).toBeCloseTo(1, 2);
  });

  it('does NOT rescale when bond length is 0.0001 (scale would be 10000×)', () => {
    const s = makeStructWithBondLength(0.0001);
    const before = s.atoms.get(1)!.pp.x;
    s.rescale();
    expect(s.atoms.get(1)!.pp.x).toBe(before);
  });

  it('does NOT rescale when bond length is 10000 (scale would be 0.0001×)', () => {
    const s = makeStructWithBondLength(10000);
    const before = s.atoms.get(1)!.pp.x;
    s.rescale();
    expect(s.atoms.get(1)!.pp.x).toBe(before);
  });

  it('DOES rescale at the boundary (bond length 100, scale = 0.01)', () => {
    const s = makeStructWithBondLength(100);
    s.rescale();
    const finalLength = Vec2.dist(s.atoms.get(0)!.pp, s.atoms.get(1)!.pp);
    expect(finalLength).toBeCloseTo(1, 2); // scale=0.01 is allowed; 100×0.01=1
  });

  it('does not throw when the struct has no bonds', () => {
    const s = new Struct();
    s.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
    expect(() => s.rescale()).not.toThrow();
  });
});
