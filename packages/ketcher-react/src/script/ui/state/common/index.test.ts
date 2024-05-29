import reducer, { updateCursorPosition } from './index';

describe('Common reducer', () => {
  it('Should return initial value', () => {
    const randomAction = { type: 'RANDOM' };

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const state = reducer(undefined, randomAction as any);
    expect(state).toEqual({ cursorPosition: { x: 0, y: 0 } });
  });

  it('Should set new cursor position', () => {
    const initialState = { cursorPosition: { x: 40, y: 60 } };
    const state = reducer(initialState, updateCursorPosition(150, 500));
    expect(state).toEqual({ cursorPosition: { x: 150, y: 500 } });
  });
});
