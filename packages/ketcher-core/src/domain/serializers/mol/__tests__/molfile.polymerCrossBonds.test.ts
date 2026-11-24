import { vi } from 'vitest';
import { KetSerializer } from 'domain/serializers/ket/ketSerializer';
import { MolSerializer } from '../molSerializer';

// The structure from #12852: a polystyrene unit whose repeating group holds
// only the CH and CH2, so three bonds cross its brackets (two end atoms and
// the phenyl ring)
const polystyreneKet = (sgroup: Record<string, unknown>) =>
  JSON.stringify({
    root: { nodes: [{ $ref: 'mol0' }] },
    mol0: {
      type: 'molecule',
      atoms: [
        { label: 'C', location: [13.4352, -10.9503, 0] },
        { label: 'C', location: [15.1648, -10.9498, 0] },
        { label: 'C', location: [14.3016, -10.4504, 0] },
        { label: 'C', location: [15.1648, -11.9503, 0] },
        { label: 'C', location: [13.4352, -11.9548, 0] },
        { label: 'C', location: [14.3038, -12.4496, 0] },
        { label: 'C', location: [14.3022, -9.4504, 0] },
        { label: '*', location: [16.0343, -9.4514, 0] },
        { label: '*', location: [13.4365, -8.9498, 0] },
        { label: 'C', location: [15.1686, -8.9509, 0] },
      ],
      bonds: [
        { type: 2, atoms: [2, 0] },
        { type: 1, atoms: [0, 4] },
        { type: 2, atoms: [4, 5] },
        { type: 1, atoms: [5, 3] },
        { type: 2, atoms: [3, 1] },
        { type: 1, atoms: [1, 2] },
        { type: 1, atoms: [2, 6] },
        { type: 1, atoms: [6, 8] },
        { type: 1, atoms: [9, 7] },
        { type: 1, atoms: [6, 9] },
      ],
      sgroups: [{ atoms: [9, 6], connectivity: 'HT', ...sgroup }],
    },
  });

const toMolfileLines = (ket: string) =>
  new MolSerializer()
    .serialize(new KetSerializer().deserialize(ket))
    .split('\n');

describe('Molfile V2000 export of polymers with more than two crossing bonds (#12852)', () => {
  // Bracket positions are measured with the editor's render, which only adds
  // R-group attachment points here; this structure has none
  beforeEach(() => {
    vi.stubGlobal('ketcher', {
      editor: {
        render: {
          ctab: { getRGroupAttachmentPointsVBoxByAtomIds: () => undefined },
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('exports an SRU polymer with three crossing bonds', () => {
    const lines = toMolfileLines(
      polystyreneKet({ type: 'SRU', subscript: 'n' }),
    );

    expect(lines).toContain('M  STY  1   1 SRU');
    expect(lines).toContain('M  SBL   1  3   7   8   9');
    expect(
      lines.filter((line) => line.startsWith('M  SDI   1  4')).length,
    ).toBeGreaterThanOrEqual(2);
  });

  it('exports a copolymer with three crossing bonds', () => {
    const lines = toMolfileLines(polystyreneKet({ type: 'COP' }));

    expect(lines).toContain('M  STY  1   1 COP');
    expect(lines).toContain('M  SBL   1  3   7   8   9');
  });
});
