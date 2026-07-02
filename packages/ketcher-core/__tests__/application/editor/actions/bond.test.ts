import * as utils from 'application/editor/actions/utils';

import { type Action, fromBondAddition } from 'application/editor/actions';
import type { ReStruct } from 'application/render';

import { restruct, singleBond } from '../../../mock-data';

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('Bond Addition', () => {
  let reStruct: ReStruct;
  let action: Action;
  let begin: number;
  let end: number;

  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockStruct: any = { ...((restruct as any) || {}) };
    mockStruct.molecule.sgroups = [];
    mockStruct.visibleAtoms = new Map();
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
