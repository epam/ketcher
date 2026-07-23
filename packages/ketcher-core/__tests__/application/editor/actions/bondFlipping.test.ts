import { fromBondFlipping } from 'application/editor/actions/bond';
import * as bondStereoModule from 'application/editor/actions/bondStereo';
import { Action } from 'application/editor/actions';
import { Atom } from 'domain/entities/atom';
import { Bond } from 'domain/entities/bond';
import { Fragment } from 'domain/entities/fragment';
import { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';
import { ReAtom, ReBond } from 'application/render';

function buildRestruct(stereo: number, stereoLabel: string | null = null) {
  const struct = new Struct();

  const resolvedLabel = stereoLabel ?? (stereo ? 'abs' : null);

  const atomBegin = new Atom({
    label: 'C',
    pp: new Vec2(0, 0),
    implicitH: 1,
    stereoLabel: resolvedLabel,
    stereoParity: stereo ? 1 : 0,
    fragment: 0,
  });
  const atomEnd = new Atom({
    label: 'C',
    pp: new Vec2(1, 0),
    implicitH: 1,
    fragment: 0,
  });
  const atomExtra = new Atom({
    label: 'C',
    pp: new Vec2(-1, 0),
    implicitH: 1,
    fragment: 0,
  });

  const beginId = struct.atoms.add(atomBegin);
  const endId = struct.atoms.add(atomEnd);
  const extraId = struct.atoms.add(atomExtra);

  const stereoBond = new Bond({
    begin: beginId,
    end: endId,
    type: Bond.PATTERN.TYPE.SINGLE,
    stereo,
  });
  const extraBond = new Bond({
    begin: beginId,
    end: extraId,
    type: Bond.PATTERN.TYPE.SINGLE,
    stereo: Bond.PATTERN.STEREO.NONE,
  });

  const bondId = struct.bonds.add(stereoBond);
  struct.bonds.add(extraBond);

  const fragment = new Fragment(stereo ? [beginId] : []);
  struct.frags.add(fragment);

  const restruct = {
    molecule: struct,
    atoms: new Map([
      [beginId, new ReAtom(atomBegin)],
      [endId, new ReAtom(atomEnd)],
      [extraId, new ReAtom(atomExtra)],
    ]),
    bonds: new Map([[bondId, new ReBond(stereoBond)]]),
    enhancedFlags: new Map(),
    enhancedFlagsChanged: new Map(),
    atomsChanged: new Map(),
    bondsChanged: new Map(),
    render: { options: { stereoLabelStyle: 'Off' } },
    markAtom: jest.fn(),
    markBond: jest.fn(),
    markItem: jest.fn(),
    markItemRemoved: jest.fn(),
    clearVisel: jest.fn(),
    loopRemove: jest.fn(),
    connectedComponents: new Map(),
  };

  return { restruct, bondId, beginId, endId };
}

describe('fromBondFlipping', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('transfers stereoLabel and stereoParity from old begin to old end for a stereo bond', () => {
    const { restruct, bondId, beginId, endId } = buildRestruct(
      Bond.PATTERN.STEREO.UP,
    );

    fromBondFlipping(restruct as never, bondId);

    const struct = restruct.molecule;
    const beginAtom = struct.atoms.get(beginId);
    const endAtom = struct.atoms.get(endId);

    expect(beginAtom?.stereoLabel).toBeNull();
    expect(beginAtom?.stereoParity).toBe(0);
    expect(endAtom?.stereoLabel).toBe('abs');
    expect(endAtom?.stereoParity).toBe(1);
  });

  it('transfers non-abs stereoLabel (&1) so it is preserved after flip', () => {
    const { restruct, bondId, beginId, endId } = buildRestruct(
      Bond.PATTERN.STEREO.UP,
      '&1',
    );

    fromBondFlipping(restruct as never, bondId);

    const struct = restruct.molecule;
    const beginAtom = struct.atoms.get(beginId);
    const endAtom = struct.atoms.get(endId);

    expect(beginAtom?.stereoLabel).toBeNull();
    expect(endAtom?.stereoLabel).toBe('&1');
  });

  it('moves stereo atom membership from old begin to old end in the fragment', () => {
    const { restruct, bondId, beginId, endId } = buildRestruct(
      Bond.PATTERN.STEREO.DOWN,
    );

    fromBondFlipping(restruct as never, bondId);

    const fragment = restruct.molecule.frags.get(0);
    expect(fragment?.stereoAtoms).not.toContain(beginId);
    expect(fragment?.stereoAtoms).toContain(endId);
  });

  it('does not call fromBondStereoUpdate for a non-stereo bond', () => {
    const spy = jest
      .spyOn(bondStereoModule, 'fromBondStereoUpdate')
      .mockReturnValue(new Action());

    const { restruct, bondId } = buildRestruct(Bond.PATTERN.STEREO.NONE);

    fromBondFlipping(restruct as never, bondId);

    expect(spy).not.toHaveBeenCalled();
  });

  it('swaps bond begin and end after flip', () => {
    const { restruct, bondId, beginId, endId } = buildRestruct(
      Bond.PATTERN.STEREO.DOWN,
    );

    fromBondFlipping(restruct as never, bondId);

    const newBond = Array.from(restruct.molecule.bonds.values()).find(
      (b) => b.begin === endId && b.end === beginId,
    );
    expect(newBond).toBeDefined();
  });
});
