import * as utils from 'application/editor/actions/utils';

import {
  type Action,
  fromBondAddition,
  fromBondsMerge,
} from 'application/editor/actions';
import { ReStruct, Render } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import { AtomAdd } from 'application/editor/operations/atom/AtomAdd';
import { BondAdd } from 'application/editor/operations/bond/BondAdd';
import { Atom, Bond, Struct, Vec2 } from 'domain/entities';

import { restruct, singleBond } from '../../../mock-data';

function buildEmptyReStruct() {
  const options = {
    microModeScale: 20,
    width: 100,
    height: 100,
  } as RenderOptions;
  const render = new Render(document as unknown as HTMLElement, options);
  return new ReStruct(new Struct(), render);
}

function addAtomToReStruct(reStruct: ReStruct, pos: Vec2) {
  const op = new AtomAdd({ label: 'C' }, pos);
  op.execute(reStruct);
  return op.data.aid as number;
}

function addBondToReStruct(
  reStruct: ReStruct,
  begin: number,
  end: number,
  type: number,
) {
  new BondAdd(begin, end, { type }).execute(reStruct);
}

function buildAssignedReStruct(struct: Struct) {
  const options = {
    microModeScale: 20,
    width: 100,
    height: 100,
  } as RenderOptions;
  const render = new Render(document as unknown as HTMLElement, options);
  const reStruct = new ReStruct(struct, render);
  reStruct.assignConnectedComponents();
  return reStruct;
}

function addAtomToStruct(struct: Struct, pos: Vec2) {
  return struct.atoms.add(new Atom({ label: 'C', pp: pos, fragment: 0 }));
}

function addSingleBondToStruct(struct: Struct, begin: number, end: number) {
  return struct.bonds.add(
    new Bond({ begin, end, type: Bond.PATTERN.TYPE.SINGLE }),
  );
}

describe.skip('Bond Addition', () => {
  let reStruct: ReStruct;
  let action: Action;
  let begin: number;
  let end: number;

  beforeAll(() => {
    const mockStruct = { ...restruct } as unknown as ReStruct;
    mockStruct.molecule.sgroups =
      [] as unknown as ReStruct['molecule']['sgroups'];
    mockStruct.visibleAtoms = new Map() as unknown as ReStruct['visibleAtoms'];
    reStruct = mockStruct;
    const [actionData, beginData, endData] = fromBondAddition(
      reStruct,
      singleBond,
      1,
      {
        label: 'C',
      },
    );

    action = actionData;
    begin = beginData;
    end = endData;
  });

  test('function `atomForNewBond` will be called if `endAtomPos` is `undefined`', () => {
    const spy = jest.spyOn(utils, 'atomForNewBond');
    fromBondAddition(reStruct, singleBond, 3, { label: 'C' });
    expect(spy).toHaveBeenCalled();
  });
  test('function `atomGetAttr` will be called', () => {
    const spy = jest.spyOn(utils, 'atomGetAttr');
    fromBondAddition(reStruct, singleBond, 5, 1);
    expect(spy).toHaveBeenCalled();
  });
  it('should contain operation CalcImplicitH', () => {
    const CalcImplicitH = action.operations.find(
      (operation) => operation.type === 'Calculate implicit hydrogen',
    );
    expect(CalcImplicitH).toBeDefined();
  });
  it('should contain operation Add fragment stereo flag', () => {
    const addFragment = action.operations.find(
      (operation) => operation.type === 'Add fragment stereo flag',
    );
    expect(addFragment).toBeDefined();
  });
  test('bond begin should be defined', () => {
    expect(begin).toBeDefined();
  });
  test('bond end should be defined', () => {
    expect(end).toBeDefined();
  });
});

// Regression test for https://github.com/epam/ketcher/issues/2429:
// clicking an atom that already has two neighbor bonds (e.g. a Template
// ring atom or an interior Chain atom) with the Triple Bond tool must place
// the new bond in the widest free angle, same as any other bond type -
// not collinear (180 deg) with an arbitrary existing neighbor bond.
describe('atomForNewBond', () => {
  it('places a new bond at the same free angle for Triple as for Double when the atom already has two neighbor bonds', () => {
    const reStruct = buildEmptyReStruct();
    // center atom with two existing single bonds, mimicking a ring/chain atom
    const center = addAtomToReStruct(reStruct, new Vec2(0, 0));
    const left = addAtomToReStruct(reStruct, new Vec2(-1, 0));
    const upperRight = addAtomToReStruct(reStruct, new Vec2(0.5, 0.87));
    addBondToReStruct(reStruct, center, left, Bond.PATTERN.TYPE.SINGLE);
    addBondToReStruct(reStruct, center, upperRight, Bond.PATTERN.TYPE.SINGLE);

    const doubleResult = utils.atomForNewBond(reStruct, center, {
      type: Bond.PATTERN.TYPE.DOUBLE,
    });
    const tripleResult = utils.atomForNewBond(reStruct, center, {
      type: Bond.PATTERN.TYPE.TRIPLE,
    });

    expect((tripleResult.pos as Vec2).x).toBeCloseTo(
      (doubleResult.pos as Vec2).x,
    );
    expect((tripleResult.pos as Vec2).y).toBeCloseTo(
      (doubleResult.pos as Vec2).y,
    );
  });

  it('still places a Triple bond 180 deg opposite an existing Single bond when the atom has only one neighbor', () => {
    const reStruct = buildEmptyReStruct();
    const center = addAtomToReStruct(reStruct, new Vec2(0, 0));
    const left = addAtomToReStruct(reStruct, new Vec2(-1, 0));
    addBondToReStruct(reStruct, center, left, Bond.PATTERN.TYPE.SINGLE);

    const tripleResult = utils.atomForNewBond(reStruct, center, {
      type: Bond.PATTERN.TYPE.TRIPLE,
    });

    expect((tripleResult.pos as Vec2).x).toBeCloseTo(1);
    expect((tripleResult.pos as Vec2).y).toBeCloseTo(0);
  });
});

// Regression test for https://github.com/epam/ketcher/issues/346: an
// earlier pair in the same batch can delete another pair's target atom;
// fromBondsMerge must resolve to the atom that actually survived.
describe('fromBondsMerge: chained merges within one batch', () => {
  it('redirects a merge to the surviving atom instead of a stale/deleted one', () => {
    const struct = new Struct();

    // Pair Y (processed first): A-A2 fuses to B-B2, so A is deleted, B survives.
    const a = addAtomToStruct(struct, new Vec2(0, 0));
    const a2 = addAtomToStruct(struct, new Vec2(1, 0));
    const b = addAtomToStruct(struct, new Vec2(0, 0));
    const b2 = addAtomToStruct(struct, new Vec2(1, 0));
    const bondYSrc = addSingleBondToStruct(struct, a, a2);
    const bondYDst = addSingleBondToStruct(struct, b, b2);

    // Pair X: C-C2 fuses to A-A3 - its target A is the atom pair Y just deleted.
    const c = addAtomToStruct(struct, new Vec2(2, 0));
    const c2 = addAtomToStruct(struct, new Vec2(3, 0));
    const a3 = addAtomToStruct(struct, new Vec2(1, 0));
    const bondXSrc = addSingleBondToStruct(struct, c, c2);
    const bondXDst = addSingleBondToStruct(struct, a, a3);

    const reStruct = buildAssignedReStruct(struct);

    const mergeMap = new Map<number, number>([
      [bondYSrc, bondYDst],
      [bondXSrc, bondXDst],
    ]);

    expect(() => fromBondsMerge(reStruct, mergeMap)).not.toThrow();

    // C must have been redirected to the surviving B, not left unmerged.
    expect(struct.atoms.has(a)).toBe(false);
    expect(struct.atoms.has(c)).toBe(false);
    expect(struct.atoms.has(b)).toBe(true);
  });
});
