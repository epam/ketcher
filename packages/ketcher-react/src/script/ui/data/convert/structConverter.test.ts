import { Atom, Struct, Vec2, SupportedFormat } from 'ketcher-core';
import { couldBeSaved } from 'src/script/ui/data/convert/structConverter';

function createStructWithAtomCount(atomCount: number): Struct {
  const struct = new Struct();

  for (let i = 0; i < atomCount; i++) {
    struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(i, 0) }));
  }

  return struct;
}

describe('couldBeSaved', () => {
  it('warns about V3000 upgrade for oversized mol saves', () => {
    const warnings = couldBeSaved(
      createStructWithAtomCount(1000),
      SupportedFormat.mol,
    );

    expect(warnings).toContain('V3000');
  });

  it('does not warn for small structures saved as mol', () => {
    const warnings = couldBeSaved(
      createStructWithAtomCount(10),
      SupportedFormat.mol,
    );

    expect(warnings).toBeNull();
  });
});
