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

describe('sgroup non-null assertion replacements', () => {
  it('should throw when cloning with missing atom remap', () => {
    const sGroup = new SGroup('MUL');
    sGroup.atoms = [1];

    expect(() => SGroup.clone(sGroup, new Map())).toThrow('Assertion failed');
  });

  it('should throw when updateOffset is called without bracket box', () => {
    const sGroup = new SGroup('MUL');

    expect(() => sGroup.updateOffset(new Vec2(1, 1))).toThrow(
      'Assertion failed',
    );
  });

  it('should throw when second cross bond is not found in bonds pool', () => {
    const atomSet = new Pile<number>();
    const bb = new Box2Abs(new Vec2(0, 0), new Vec2(1, 1));
    const bonds = new Pool<Bond>();
    const existingBondId = bonds.add(mock<Bond>());

    expect(() =>
      SGroup.getBracketParameters(
        { bonds },
        { 0: [existingBondId], 1: [existingBondId + 1] },
        atomSet,
        bb,
      ),
    ).toThrow('Assertion failed');
  });

  it('should throw when else-branch cross bond id has no matching bond', () => {
    const atomSet = new Pile<number>();
    const bb = new Box2Abs(new Vec2(0, 0), new Vec2(1, 1));
    const bonds = new Pool<Bond>();

    expect(() =>
      SGroup.getBracketParameters({ bonds }, { 0: [1, 2] }, atomSet, bb),
    ).toThrow('Assertion failed');
  });

  it('should throw when mass centre uses missing atom id', () => {
    const atoms = new Pool<Atom>();
    expect(() => SGroup.getMassCentre({ atoms }, [1])).toThrow(
      'Assertion failed',
    );
  });
});
