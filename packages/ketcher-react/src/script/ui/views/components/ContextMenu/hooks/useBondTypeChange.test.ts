import { act, renderHook } from '@testing-library/react';
import {
  Atom,
  Bond,
  bondChangingAction,
  fromBondsAttrs,
  ketcherProvider,
  Struct,
  Vec2,
} from 'ketcher-core';
import useBondTypeChange from './useBondTypeChange';

jest.mock('src/hooks', () => ({
  useAppContext: () => ({ ketcherId: 'test-ketcher-id' }),
}));

jest.mock('ketcher-core', () => {
  const actual = jest.requireActual('ketcher-core');

  return {
    ...actual,
    bondChangingAction: jest.fn(() => 'bond-changing-action'),
    fromBondsAttrs: jest.fn(() => 'bonds-attrs-action'),
  };
});

const { TYPE, STEREO } = Bond.PATTERN;

function setUpEditor(bonds: Array<{ type: number; stereo: number }>) {
  const struct = new Struct();
  const atomIds = [0, 1, 2].map((x) =>
    struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(x, 0) })),
  );
  const bondIds = bonds.map(({ type, stereo }, i) =>
    struct.bonds.add(
      new Bond({ begin: atomIds[i], end: atomIds[i + 1], type, stereo }),
    ),
  );
  const restruct = {
    bonds: new Map(bondIds.map((id) => [id, { b: struct.bonds.get(id) }])),
  };
  const update = jest.fn();
  jest.spyOn(ketcherProvider, 'getKetcher').mockReturnValue({
    editor: { struct: () => struct, render: { ctab: restruct }, update },
  } as never);

  return { bondIds, restruct, update };
}

function chooseBondType(toolName: string, bondIds: number[]) {
  const { result } = renderHook(() => useBondTypeChange());
  const [handler] = result.current;

  act(() => {
    handler({
      id: toolName,
      props: { id: 'bond-context-menu', bondIds },
      // react-contexify types the trigger as MouseEvent & TouchEvent &
      // KeyboardEvent, which no real event satisfies; the handler ignores it
      triggerEvent: new MouseEvent('contextmenu') as never,
    });
  });
}

describe('useBondTypeChange', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('sets a double bond to single instead of advancing it (#10377)', () => {
    const { bondIds, restruct, update } = setUpEditor([
      { type: TYPE.DOUBLE, stereo: STEREO.NONE },
    ]);

    chooseBondType('bond-single', bondIds);

    expect(bondChangingAction).not.toHaveBeenCalled();
    expect(fromBondsAttrs).toHaveBeenCalledWith(
      restruct,
      bondIds,
      expect.objectContaining({ type: TYPE.SINGLE, stereo: STEREO.NONE }),
    );
    expect(update).toHaveBeenCalledWith('bonds-attrs-action');
  });

  it('keeps a single bond single when Single is chosen again (#10377)', () => {
    const { bondIds, restruct } = setUpEditor([
      { type: TYPE.SINGLE, stereo: STEREO.NONE },
    ]);

    chooseBondType('bond-single', bondIds);

    expect(bondChangingAction).not.toHaveBeenCalled();
    expect(fromBondsAttrs).toHaveBeenCalledWith(
      restruct,
      bondIds,
      expect.objectContaining({ type: TYPE.SINGLE }),
    );
  });

  it('flips a wedge bond when its own type is chosen again (#4188)', () => {
    const { bondIds, restruct, update } = setUpEditor([
      { type: TYPE.SINGLE, stereo: STEREO.UP },
    ]);

    chooseBondType('bond-up', bondIds);

    expect(bondChangingAction).toHaveBeenCalledWith(
      restruct,
      bondIds[0],
      restruct.bonds.get(bondIds[0])?.b,
      expect.objectContaining({ type: TYPE.SINGLE, stereo: STEREO.UP }),
    );
    expect(update).toHaveBeenCalledWith('bond-changing-action');
  });

  it('sets the chosen type on every selected bond', () => {
    const { bondIds, restruct } = setUpEditor([
      { type: TYPE.DOUBLE, stereo: STEREO.NONE },
      { type: TYPE.SINGLE, stereo: STEREO.NONE },
    ]);

    chooseBondType('bond-single', bondIds);

    expect(bondChangingAction).not.toHaveBeenCalled();
    expect(fromBondsAttrs).toHaveBeenCalledWith(
      restruct,
      bondIds,
      expect.objectContaining({ type: TYPE.SINGLE }),
    );
  });
});
