import * as utils from 'application/editor/actions/utils';

import { type Action, fromBondAddition } from 'application/editor/actions';
import { ReStruct, Render } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import { AtomAdd } from 'application/editor/operations/atom/AtomAdd';
import { BondAdd } from 'application/editor/operations/bond/BondAdd';
import { Bond, Struct, Vec2 } from 'domain/entities';

import { restruct, singleBond } from '../../../mock-data';

// eslint-disable-next-line jest/no-disabled-tests
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
  function buildReStruct() {
    const options = {
      microModeScale: 20,
      width: 100,
      height: 100,
    } as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, options);
    return new ReStruct(new Struct(), render);
  }

  function addAtom(reStruct: ReStruct, pos: Vec2) {
    const op = new AtomAdd({ label: 'C' }, pos);
    op.execute(reStruct);
    return op.data.aid as number;
  }

  function addBond(
    reStruct: ReStruct,
    begin: number,
    end: number,
    type: number,
  ) {
    new BondAdd(begin, end, { type }).execute(reStruct);
  }

  it('places a new bond at the same free angle for Triple as for Double when the atom already has two neighbor bonds', () => {
    const reStruct = buildReStruct();
    // center atom with two existing single bonds, mimicking a ring/chain atom
    const center = addAtom(reStruct, new Vec2(0, 0));
    const left = addAtom(reStruct, new Vec2(-1, 0));
    const upperRight = addAtom(reStruct, new Vec2(0.5, 0.87));
    addBond(reStruct, center, left, Bond.PATTERN.TYPE.SINGLE);
    addBond(reStruct, center, upperRight, Bond.PATTERN.TYPE.SINGLE);

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
    const reStruct = buildReStruct();
    const center = addAtom(reStruct, new Vec2(0, 0));
    const left = addAtom(reStruct, new Vec2(-1, 0));
    addBond(reStruct, center, left, Bond.PATTERN.TYPE.SINGLE);

    const tripleResult = utils.atomForNewBond(reStruct, center, {
      type: Bond.PATTERN.TYPE.TRIPLE,
    });

    expect((tripleResult.pos as Vec2).x).toBeCloseTo(1);
    expect((tripleResult.pos as Vec2).y).toBeCloseTo(0);
  });
});
