import { Atom } from 'domain/entities/atom';
import { Bond } from 'domain/entities/bond';
import { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';

describe('Struct.rescale() scale-sanity guard', () => {
  function makeStructWithBondLength(length: number): {
    s: Struct;
    id1: number;
    id2: number;
  } {
    const s = new Struct();
    const id1 = s.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
    const id2 = s.atoms.add(new Atom({ label: 'C', pp: new Vec2(length, 0) }));
    s.bonds.add(
      new Bond({ begin: id1, end: id2, type: Bond.PATTERN.TYPE.SINGLE }),
    );
    return { s, id1, id2 };
  }

  it('rescales normally for typical bond length (1.5 → result ≈ 1)', () => {
    const { s, id1, id2 } = makeStructWithBondLength(1.5);
    s.rescale();
    const a1 = s.atoms.get(id1);
    const a2 = s.atoms.get(id2);
    if (!a1 || !a2) throw new Error('atoms missing');
    const finalLength = Vec2.dist(a1.pp, a2.pp);
    expect(finalLength).toBeCloseTo(1, 2);
  });

  it('does NOT rescale when bond length is 0.0001 (scale would be 10000×)', () => {
    const { s, id2 } = makeStructWithBondLength(0.0001);
    const a2 = s.atoms.get(id2);
    if (!a2) throw new Error('atom missing');
    const before = a2.pp.x;
    s.rescale();
    expect(a2.pp.x).toBe(before);
  });

  it('does NOT rescale when bond length is 10000 (scale would be 0.0001×)', () => {
    const { s, id2 } = makeStructWithBondLength(10000);
    const a2 = s.atoms.get(id2);
    if (!a2) throw new Error('atom missing');
    const before = a2.pp.x;
    s.rescale();
    expect(a2.pp.x).toBe(before);
  });

  it('DOES rescale at the MIN_RESCALE boundary (bond length 100, scale = 0.01)', () => {
    const { s, id1, id2 } = makeStructWithBondLength(100);
    s.rescale();
    const a1 = s.atoms.get(id1);
    const a2 = s.atoms.get(id2);
    if (!a1 || !a2) throw new Error('atoms missing');
    const finalLength = Vec2.dist(a1.pp, a2.pp);
    expect(finalLength).toBeCloseTo(1, 2); // scale=0.01 is allowed; 100×0.01=1
  });

  it('DOES rescale at the MAX_RESCALE boundary (bond length 0.01, scale = 100)', () => {
    const { s, id1, id2 } = makeStructWithBondLength(0.01);
    s.rescale();
    const a1 = s.atoms.get(id1);
    const a2 = s.atoms.get(id2);
    if (!a1 || !a2) throw new Error('atoms missing');
    const finalLength = Vec2.dist(a1.pp, a2.pp);
    expect(finalLength).toBeCloseTo(1, 2); // scale=100 is allowed; 0.01×100=1
  });

  it('does not throw when the struct has no bonds', () => {
    const s = new Struct();
    s.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
    expect(() => s.rescale()).not.toThrow();
  });
});
