import { Atom, Bond, Struct, Vec2 } from 'domain/entities';

const bondLength = (struct: Struct, a: number, b: number) =>
  Vec2.dist(
    struct.atoms.get(a)?.pp ?? new Vec2(),
    struct.atoms.get(b)?.pp ?? new Vec2(),
  );

describe('Struct.rescale normalizes by the median bond length (#3406)', () => {
  it('does not shrink the structure when a long outlier bond is present', () => {
    const struct = new Struct();
    // A hexagon with bond length 1 — the "real" structure.
    const ring: number[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      ring.push(
        struct.atoms.add(
          new Atom({ label: 'C', pp: new Vec2(Math.cos(a), Math.sin(a)) }),
        ),
      );
    }
    for (let i = 0; i < 6; i++) {
      const b = struct.bonds.add(
        new Bond({ begin: ring[i], end: ring[(i + 1) % 6], type: 1 }),
      );
      struct.bondInitHalfBonds(b);
    }
    // One long bond (length 9) — e.g. between two functional groups far apart.
    const l1 = struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(5, -5) }));
    const l2 = struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(14, -5) }));
    const lb = struct.bonds.add(new Bond({ begin: l1, end: l2, type: 1 }));
    struct.bondInitHalfBonds(lb);
    struct.initNeighbors();

    const ringBefore = bondLength(struct, ring[0], ring[1]);
    struct.rescale();
    const ringAfter = bondLength(struct, ring[0], ring[1]);

    // Median bond length is 1, so the ring keeps its size (the mean would have
    // shrunk it to ~0.47).
    expect(ringBefore).toBeCloseTo(1);
    expect(ringAfter).toBeCloseTo(1);
  });

  it('still normalizes a uniform structure to bond length 1', () => {
    const struct = new Struct();
    const a1 = struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
    const a2 = struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(2, 0) }));
    const b = struct.bonds.add(new Bond({ begin: a1, end: a2, type: 1 }));
    struct.bondInitHalfBonds(b);
    struct.initNeighbors();

    struct.rescale();

    expect(bondLength(struct, a1, a2)).toBeCloseTo(1);
  });
});
