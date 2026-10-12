import {
  Atom,
  SGroup,
  SGroupAttachmentPoint,
  Struct,
  Vec2,
  SupportedFormat,
} from 'ketcher-core';
import {
  couldBeSaved,
  filterAttachmentPointStereoWarnings,
} from 'src/script/ui/data/convert/structConverter';

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

describe('filterAttachmentPointStereoWarnings', () => {
  it('ignores a stereo warning when all reported atoms are attachment points', () => {
    const struct = new Struct();
    struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
    struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(1, 0) }));
    struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(2, 0) }));
    const sgroup = new SGroup('SUP');
    sgroup.atoms = [0, 1, 2];
    sgroup.addAttachmentPoints([
      new SGroupAttachmentPoint(1, undefined, '1'),
      new SGroupAttachmentPoint(2, undefined, '2'),
    ]);
    struct.sgroups.add(sgroup);

    expect(
      filterAttachmentPointStereoWarnings(struct, {
        stereo:
          'Structure contains stereocenters with undefined stereo configuration: (1,2)',
      }),
    ).toEqual({});
  });

  it('uses the remapped atom IDs used by the structure checker', () => {
    const struct = new Struct();
    struct.atoms.set(10, new Atom({ label: 'C', pp: new Vec2(0, 0) }));
    struct.atoms.set(20, new Atom({ label: 'C', pp: new Vec2(1, 0) }));
    const sgroup = new SGroup('SUP');
    sgroup.atoms = [10, 20];
    sgroup.addAttachmentPoints([
      new SGroupAttachmentPoint(10, undefined, '1'),
      new SGroupAttachmentPoint(20, undefined, '2'),
    ]);
    struct.sgroups.add(sgroup);

    expect(
      filterAttachmentPointStereoWarnings(struct, {
        stereo:
          'Structure contains stereocenters with undefined stereo configuration: (0,1)',
      }),
    ).toEqual({});
  });

  it('ignores checker atom IDs within the SUP group when they match its attachment count', () => {
    const struct = new Struct();
    for (let atomId = 0; atomId < 3; atomId++) {
      struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(atomId, 0) }));
    }
    const sgroup = new SGroup('SUP');
    sgroup.atoms = [0, 1, 2];
    sgroup.addAttachmentPoints([
      new SGroupAttachmentPoint(1, undefined, '1'),
      new SGroupAttachmentPoint(2, undefined, '2'),
    ]);
    struct.sgroups.add(sgroup);

    expect(
      filterAttachmentPointStereoWarnings(struct, {
        stereo:
          'Warning: Structure contains stereocenters with undefined stereo configuration: (0,1).',
      }),
    ).toEqual({});
  });

  it('keeps stereo warnings that include atoms other than attachment points', () => {
    const struct = new Struct();
    struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
    struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(1, 0) }));
    struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(2, 0) }));
    const sgroup = new SGroup('SUP');
    sgroup.atoms = [0, 1, 2];
    sgroup.addAttachmentPoint(new SGroupAttachmentPoint(1, undefined, '1'));
    struct.sgroups.add(sgroup);
    const errors = {
      stereo:
        'Structure contains stereocenters with undefined stereo configuration: (1,3)',
    };

    expect(filterAttachmentPointStereoWarnings(struct, errors)).toEqual(errors);
  });

  it('keeps undefined stereo warnings when there are no attachment points', () => {
    const struct = new Struct();
    const errors = {
      stereo:
        'Structure contains stereocenters with undefined stereo configuration: (1,2)',
    };

    expect(filterAttachmentPointStereoWarnings(struct, errors)).toEqual(errors);
  });

  it('preserves unrelated structure-check errors', () => {
    const struct = new Struct();
    const errors = { valence: 'Structure contains atoms with bad valence' };

    expect(filterAttachmentPointStereoWarnings(struct, errors)).toEqual(errors);
  });
});
