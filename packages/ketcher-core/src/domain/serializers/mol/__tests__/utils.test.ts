import { Atom } from 'domain/entities/atom';
import { Bond } from 'domain/entities/bond';
import { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';
import utils from 'domain/serializers/mol/utils';

/** Two-atom fragment whose single bond has the given length. */
function fragment(bondLength: number): Struct {
  const s = new Struct();
  const a = s.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
  const b = s.atoms.add(new Atom({ label: 'C', pp: new Vec2(bondLength, 0) }));
  s.bonds.add(new Bond({ begin: a, end: b, type: Bond.PATTERN.TYPE.SINGLE }));
  return s;
}

const span = (s: Struct) => {
  const xs = [...s.atoms.values()].map((a) => a.pp.x);
  return Math.max(...xs) - Math.min(...xs);
};

describe('rxnMerge - reaction-merge rescale path', () => {
  it('normalizes a sane reaction to median bond length 1', () => {
    const mols = [fragment(2), fragment(2), fragment(2)];
    utils.rxnMerge(mols, 1, 1, 1, false);
    // median 2 -> factor 0.5 -> every fragment halved
    mols.forEach((m) => expect(span(m)).toBeCloseTo(1, 6));
  });

  it('leaves a degenerate reaction alone instead of applying an absurd factor', () => {
    // median 0.0001 -> factor 10000, outside [0.01, 100]
    const mols = [fragment(0.0001), fragment(0.0001), fragment(0.0001)];
    utils.rxnMerge(mols, 1, 1, 1, false);
    mols.forEach((m) => expect(span(m)).toBeCloseTo(0.0001, 10));
  });

  it('leaves an over-large reaction alone too', () => {
    // median 10000 -> factor 0.0001, outside [0.01, 100]
    const mols = [fragment(10000), fragment(10000)];
    utils.rxnMerge(mols, 1, 1, 0, false);
    mols.forEach((m) => expect(span(m)).toBeCloseTo(10000, 4));
  });

  it('keeps fragments sized relative to one another', () => {
    const mols = [fragment(2), fragment(2), fragment(6)];
    utils.rxnMerge(mols, 1, 1, 1, false);
    // pooled median is 2 -> factor 0.5; the 6-long fragment stays 3x the others
    expect(span(mols[0])).toBeCloseTo(1, 6);
    expect(span(mols[2])).toBeCloseTo(3, 6);
  });
});
