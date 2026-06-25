import { Action } from 'application/editor/actions/action';
import { BaseOperation } from 'application/editor/operations/BaseOperation';
import { AtomAttr } from 'application/editor/operations/atom/AtomAttr';
import { AtomMove } from 'application/editor/operations/atom/AtomMove';
import { BondAttr } from 'application/editor/operations/bond/BondAttr';
import { BondMove } from 'application/editor/operations/bond/BondMove';
import { RGroupAttr } from 'application/editor/operations/rgroup/RGroupAttr';
import { TextMove } from 'application/editor/operations/Text/TextMove';
import type { ReStruct } from 'application/render';

// Minimal ReStruct stub – the isDummy() overrides only read from
// `restruct.molecule.{atoms,bonds,rgroups}`.
const makeRestruct = (molecule: Record<string, unknown> = {}): ReStruct =>
  ({
    molecule: {
      atoms: new Map(),
      bonds: new Map(),
      rgroups: new Map(),
      ...molecule,
    },
  } as unknown as ReStruct);

describe('BaseOperation.isDummy()', () => {
  it('returns false by default (operation is treated as a real change)', () => {
    const operation = new BaseOperation('Add atom' as never);
    expect(operation.isDummy(makeRestruct())).toBe(false);
  });
});

describe('attribute operations isDummy()', () => {
  it('AtomAttr is dummy when the attribute already equals the new value', () => {
    const restruct = makeRestruct({ atoms: new Map([[1, { label: 'C' }]]) });
    expect(new AtomAttr(1, 'label', 'C').isDummy(restruct)).toBe(true);
    expect(new AtomAttr(1, 'label', 'O').isDummy(restruct)).toBe(false);
  });

  it('AtomAttr does not throw and is not dummy when the atom is gone', () => {
    const restruct = makeRestruct({ atoms: new Map() });
    expect(() => new AtomAttr(1, 'label', 'C').isDummy(restruct)).not.toThrow();
    expect(new AtomAttr(1, 'label', 'C').isDummy(restruct)).toBe(false);
  });

  it('BondAttr is dummy only when the attribute already matches', () => {
    const restruct = makeRestruct({ bonds: new Map([[1, { type: 1 }]]) });
    expect(new BondAttr(1, 'type', 1).isDummy(restruct)).toBe(true);
    expect(new BondAttr(1, 'type', 2).isDummy(restruct)).toBe(false);
  });

  it('BondAttr does not throw and is not dummy when the bond is gone', () => {
    const restruct = makeRestruct({ bonds: new Map() });
    expect(() => new BondAttr(1, 'type', 1).isDummy(restruct)).not.toThrow();
    expect(new BondAttr(1, 'type', 1).isDummy(restruct)).toBe(false);
  });

  it('RGroupAttr does not throw and is not dummy when the r-group is gone', () => {
    const restruct = makeRestruct({ rgroups: new Map() });
    expect(() =>
      new RGroupAttr(1, 'range', '>0').isDummy(restruct),
    ).not.toThrow();
    expect(new RGroupAttr(1, 'range', '>0').isDummy(restruct)).toBe(false);
  });
});

describe('move operations isDummy()', () => {
  it('is dummy for a zero displacement and real otherwise', () => {
    expect(new AtomMove(1, { x: 0, y: 0 }).isDummy()).toBe(true);
    expect(new AtomMove(1, { x: 1, y: 0 }).isDummy()).toBe(false);

    expect(new BondMove(1, { x: 0, y: 0 }).isDummy()).toBe(true);
    expect(new BondMove(1, { x: 0, y: 2 }).isDummy()).toBe(false);

    expect(new TextMove(1, { x: 0, y: 0 }).isDummy()).toBe(true);
    expect(new TextMove(1, { x: 3, y: 4 }).isDummy()).toBe(false);
  });
});

describe('Action.isDummy()', () => {
  const restruct = makeRestruct();

  it('an empty action is a dummy', () => {
    expect(new Action().isDummy()).toBe(true);
    expect(new Action().isDummy(restruct)).toBe(true);
  });

  it('with a restruct, is dummy only when every operation is a no-op', () => {
    const allDummy = new Action([
      new AtomMove(1, { x: 0, y: 0 }),
      new BondMove(2, { x: 0, y: 0 }),
    ]);
    expect(allDummy.isDummy(restruct)).toBe(true);

    const oneReal = new Action([
      new AtomMove(1, { x: 0, y: 0 }),
      new AtomMove(2, { x: 5, y: 0 }),
    ]);
    expect(oneReal.isDummy(restruct)).toBe(false);
  });

  it('an operation without an isDummy() override keeps the action non-dummy', () => {
    const action = new Action([
      new AtomMove(1, { x: 0, y: 0 }),
      new BaseOperation('Add atom' as never),
    ]);
    expect(action.isDummy(restruct)).toBe(false);
  });

  it('without a restruct, any operation makes the action non-dummy', () => {
    const action = new Action([new AtomMove(1, { x: 0, y: 0 })]);
    expect(action.isDummy()).toBe(false);
  });
});
