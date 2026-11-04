import ReAtom from 'application/render/restruct/reatom';
import { shouldDisplayHydrogen } from 'application/render/restruct/reatom';
import { ShowHydrogenLabels } from 'application/render/restruct/showHydrogenLabels';
import { MolSerializer } from 'domain/serializers/mol/molSerializer';

const carbonChain = (middleY: number) => `
  Ketcher

  3  2  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.0000    ${middleY.toFixed(4)}    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0     0  0
  2  3  1  0     0  0
M  END
`;

// Issue #12527: a carbon between two straight bonds is drawn as a heteroatom.
function middleCarbon(middleY: number) {
  const struct = new MolSerializer().deserialize(carbonChain(middleY));
  struct.initHalfBonds();
  struct.initNeighbors();
  struct.updateHalfBonds([...struct.atoms.keys()]);
  const atom = struct.atoms.get(1);
  if (!atom) throw new Error('middle atom missing');
  const reatom = new ReAtom(atom);
  reatom.label = { text: 'C' } as ReAtom['label'];
  return { struct, reatom };
}

describe('shouldDisplayHydrogen for a carbon between two straight bonds', () => {
  it.each([ShowHydrogenLabels.Hetero, ShowHydrogenLabels.TerminalAndHetero])(
    'shows hydrogens with %s',
    (setting) => {
      const { struct, reatom } = middleCarbon(0);
      expect(shouldDisplayHydrogen(struct, reatom, setting)).toBe(true);
    },
  );

  it.each([ShowHydrogenLabels.Off, ShowHydrogenLabels.Terminal])(
    'hides hydrogens with %s',
    (setting) => {
      const { struct, reatom } = middleCarbon(0);
      expect(shouldDisplayHydrogen(struct, reatom, setting)).toBe(false);
    },
  );

  it('keeps hydrogens hidden for a bent carbon with Hetero', () => {
    const { struct, reatom } = middleCarbon(0.5);
    expect(
      shouldDisplayHydrogen(struct, reatom, ShowHydrogenLabels.Hetero),
    ).toBe(false);
  });
});
