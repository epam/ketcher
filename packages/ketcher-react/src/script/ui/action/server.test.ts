import config from './server';

// server.ts builds some thunks at import time, so the transform the mock
// returns has to exist before the test body runs
jest.mock('../state/server', () => {
  const transform = jest.fn();

  return { serverTransform: jest.fn(() => transform), transform };
});

const { transform: mockToggleExplicitHydrogens } = jest.requireMock<{
  transform: jest.Mock;
}>('../state/server');

const runExplicitHydrogensAction = (selection: object | null) => {
  const dispatch = jest.fn();
  // A stand-in for the store: the action only reads the editor selection
  const getState = () => ({ editor: { selection: () => selection } }) as never;

  const { action } = config['explicit-hydrogens'];

  if (typeof action === 'function' || !('thunk' in action) || !action.thunk) {
    throw new Error('explicit-hydrogens is expected to be a thunk action');
  }

  action.thunk(dispatch, getState);

  return dispatch;
};

describe('explicit-hydrogens action', () => {
  it('does nothing when only bonds are selected', () => {
    runExplicitHydrogensAction({ bonds: [0, 1] });

    expect(mockToggleExplicitHydrogens).not.toHaveBeenCalled();
  });

  it('toggles hydrogens of the selected atoms when bonds are selected too', () => {
    runExplicitHydrogensAction({ atoms: [0], bonds: [1, 2] });

    expect(mockToggleExplicitHydrogens).toHaveBeenCalled();
  });

  it('toggles hydrogens of the whole structure when nothing is selected', () => {
    runExplicitHydrogensAction(null);

    expect(mockToggleExplicitHydrogens).toHaveBeenCalled();
  });
});
