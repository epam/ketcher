/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { MolSerializer } from '../molSerializer';
import common from '../common';

/**
 * `*—C—C(—*)—C—*`: an SRU covering the three carbons, so three bonds cross its
 * brackets. Two-cross-bond and zero-cross-bond variants are derived from it by
 * changing the `M  SAL` line only.
 */
const sruMolfile = (sal: string): string =>
  [
    'star-atom SRU',
    '  Ketcher',
    '',
    '  6  5  0  0  0  0            999 V2000',
    '    0.0000    0.0000    0.0000 *   0  0  0  0  0  0  0  0  0  0  0  0',
    '    1.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
    '    2.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
    '    3.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
    '    4.0000    0.0000    0.0000 *   0  0  0  0  0  0  0  0  0  0  0  0',
    '    2.0000   -1.0000    0.0000 *   0  0  0  0  0  0  0  0  0  0  0  0',
    '  1  2  1  0  0  0  0',
    '  2  3  1  0  0  0  0',
    '  3  4  1  0  0  0  0',
    '  4  5  1  0  0  0  0',
    '  3  6  1  0  0  0  0',
    'M  STY  1   1 SRU',
    'M  SLB  1   1   1',
    'M  SCN  1   1 HT ',
    'M  SMT   1 n',
    sal,
    'M  END',
  ].join('\n');

/** SRU = the three carbons; bonds 1, 4 and 5 cross the brackets. */
const threeCrossBonds = sruMolfile('M  SAL   1  3   2   3   4');
/** SRU = two carbons plus one star; bonds 1 and 4 cross the brackets. */
const twoCrossBonds = sruMolfile('M  SAL   1  4   2   3   4   6');
/** SRU = the whole molecule; nothing crosses the brackets. */
const zeroCrossBonds = sruMolfile('M  SAL   1  6   1   2   3   4   5   6');

const getSru = (molfile: string) => {
  const struct = new MolSerializer().deserialize(molfile);
  const sgroup = struct.sgroups.get(0);
  expect(sgroup!.type).toBe('SRU');
  return { struct, sgroup: sgroup! };
};

describe('prepareSruForSaving', () => {
  it('collects three crossing bonds instead of throwing', () => {
    const { struct, sgroup } = getSru(threeCrossBonds);

    expect(() => common.prepareForSaving.SRU(sgroup, struct)).not.toThrow();
    expect(sgroup.bonds).toEqual([0, 3, 4]);
  });

  it('still collects exactly two crossing bonds', () => {
    const { struct, sgroup } = getSru(twoCrossBonds);

    common.prepareForSaving.SRU(sgroup, struct);
    expect(sgroup.bonds).toEqual([0, 3]);
  });

  it('collects no crossing bonds when the whole molecule is inside the brackets', () => {
    const { struct, sgroup } = getSru(zeroCrossBonds);

    common.prepareForSaving.SRU(sgroup, struct);
    expect(sgroup.bonds).toEqual([]);
  });

  it('is used for COP as well', () => {
    const { struct, sgroup } = getSru(threeCrossBonds);

    expect(() => common.prepareForSaving.COP(sgroup, struct)).not.toThrow();
    expect(sgroup.bonds).toEqual([0, 3, 4]);
  });
});

describe('SRU molfile export', () => {
  beforeAll(() => {
    // `SGroup.bracketPos` falls back to `window.ketcher.editor.render` when no
    // render is passed; jest only provides an empty `ketcher` global.
    (window as unknown as Record<string, unknown>).ketcher = {
      editor: {
        render: {
          ctab: { getRGroupAttachmentPointsVBoxByAtomIds: () => null },
        },
      },
    };
  });

  it('writes an SBL line listing all three crossing bonds', () => {
    const struct = new MolSerializer().deserialize(threeCrossBonds);

    const molfile = new MolSerializer().serialize(struct);

    expect(molfile).toContain('M  SBL   1  3   1   4   5');
  });

  it('writes an SBL line for two crossing bonds', () => {
    const struct = new MolSerializer().deserialize(twoCrossBonds);

    const molfile = new MolSerializer().serialize(struct);

    expect(molfile).toContain('M  SBL   1  2   1   4');
  });

  it('writes no SBL line when nothing crosses the brackets', () => {
    const struct = new MolSerializer().deserialize(zeroCrossBonds);

    const molfile = new MolSerializer().serialize(struct);

    expect(molfile).not.toContain('M  SBL');
  });
});
