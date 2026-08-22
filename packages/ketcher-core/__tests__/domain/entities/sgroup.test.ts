import type { ReStruct } from 'application/render/restruct';
import { restruct } from '../../mock-data';
import { SGroup } from 'domain/entities';
import { mock } from 'jest-mock-extended';
import type { Render } from 'src';
import type { Atom } from 'domain/entities/atom';
import { Box2Abs } from 'domain/entities/box2Abs';
import type { Bond } from 'domain/entities/bond';
import { Pile } from 'domain/entities/pile';
import { Pool } from 'domain/entities/pool';
import { Vec2 } from 'domain/entities/vec2';

describe('sgroup should calculate S-Group bounding box correctly', () => {
  it('should calculate S-Group attachments points bounding box', () => {
    const render = mock<Render>();
    render.ctab = restruct as unknown as ReStruct;
    const sGroup = new SGroup('MUL');
    sGroup.atoms = [0, 1, 2, 3, 4];
    const attachmentsSpy = jest.spyOn(
      render.ctab,
      'getRGroupAttachmentPointsVBoxByAtomIds',
    );
    SGroup.bracketPos(sGroup, restruct.molecule, undefined, render);
    expect(attachmentsSpy).toHaveBeenCalled();
  });
});

const createSuperatomSGroup = (
  name: SGroup['data']['name'],
  sgroupClass: SGroup['data']['class'],
): SGroup => {
  const sgroup = new SGroup(SGroup.TYPES.SUP);

  sgroup.data.name = name;
  sgroup.data.class = sgroupClass;

  return sgroup;
};

describe('SGroup.superatomLabel getter', () => {
  it('returns the trimmed name when present', () => {
    const sgroup = createSuperatomSGroup('  Boc  ', undefined);
    expect(sgroup.superatomLabel).toBe('Boc');
  });

  it('resolves SUGAR/BASE/PHOSPHATE nucleotide component classes to their labels when name is empty', () => {
    expect(createSuperatomSGroup('', 'SUGAR').superatomLabel).toBe('Sugar');
    expect(createSuperatomSGroup('', 'BASE').superatomLabel).toBe('Base');
    expect(createSuperatomSGroup('', 'PHOSPHATE').superatomLabel).toBe(
      'Phosphate',
    );
  });

  it('resolves nucleotide component classes when name is whitespace-only', () => {
    const sgroup = createSuperatomSGroup('   ', 'SUGAR');
    expect(sgroup.superatomLabel).toBe('Sugar');
  });

  it('prefers an explicit non-empty name over the class label', () => {
    const sgroup = createSuperatomSGroup('CustomSugar', 'SUGAR');
    expect(sgroup.superatomLabel).toBe('CustomSugar');
  });

  it('returns an empty string when there is neither a name nor a known class', () => {
    expect(createSuperatomSGroup('', undefined).superatomLabel).toBe('');
    expect(createSuperatomSGroup('', 'UNKNOWN_CLASS').superatomLabel).toBe('');
  });
});

describe('sgroup non-null assertion replacements', () => {
  it('should clone with remapped atom ids when remap is complete', () => {
    const sGroup = new SGroup('MUL');
    sGroup.atoms = [1, 2];
    const remapped = new Map([
      [1, 10],
      [2, 20],
    ]);

    const clone = SGroup.clone(sGroup, remapped);

    expect(clone.atoms).toEqual([10, 20]);
  });

  it('should throw when cloning with missing atom remap', () => {
    const sGroup = new SGroup('MUL');
    sGroup.atoms = [1];

    expect(() => SGroup.clone(sGroup, new Map())).toThrow(
      'SGroup.clone: missing remapped atom id for 1',
    );
  });

  it('should throw when updateOffset is called without bracket box', () => {
    const sGroup = new SGroup('MUL');

    expect(() => sGroup.updateOffset(new Vec2(1, 1))).toThrow(
      'SGroup.updateOffset: bracketBox is required',
    );
  });

  it('should throw when second cross bond is not found in bonds pool', () => {
    const atomSet = new Pile<number>();
    const bb = new Box2Abs(new Vec2(0, 0), new Vec2(1, 1));
    const atoms = new Pool<Atom>();
    const bonds = new Pool<Bond>();
    const existingBondId = bonds.add(mock<Bond>());

    expect(() =>
      SGroup.getBracketParameters(
        { atoms, bonds },
        { 0: [existingBondId], 1: [existingBondId + 1] },
        atomSet,
        bb,
      ),
    ).toThrow(
      `SGroup.getBracketParameters: second cross-bond ${
        existingBondId + 1
      } is not found`,
    );
  });

  it('should throw when first cross bond is not found in bonds pool', () => {
    const atomSet = new Pile<number>();
    const bb = new Box2Abs(new Vec2(0, 0), new Vec2(1, 1));
    const atoms = new Pool<Atom>();
    const bonds = new Pool<Bond>();
    const existingBondId = bonds.add(mock<Bond>());

    expect(() =>
      SGroup.getBracketParameters(
        { atoms, bonds },
        { 0: [existingBondId + 1], 1: [existingBondId] },
        atomSet,
        bb,
      ),
    ).toThrow(
      `SGroup.getBracketParameters: first cross-bond ${
        existingBondId + 1
      } is not found`,
    );
  });

  it('should throw when else-branch cross bond id has no matching bond', () => {
    const atomSet = new Pile<number>();
    const bb = new Box2Abs(new Vec2(0, 0), new Vec2(1, 1));
    const atoms = new Pool<Atom>();
    const bonds = new Pool<Bond>();

    expect(() =>
      SGroup.getBracketParameters({ atoms, bonds }, { 0: [1, 2] }, atomSet, bb),
    ).toThrow('SGroup.getBracketParameters: cross-bond 1 is not found');
  });

  it('should throw when mass centre uses missing atom id', () => {
    const atoms = new Pool<Atom>();
    expect(() => SGroup.getMassCentre({ atoms }, [1])).toThrow(
      'SGroup.getMassCentre: atom 1 is not found',
    );
  });
});
