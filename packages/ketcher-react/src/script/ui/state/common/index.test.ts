import reducer, { updateCursorPosition } from './index';

describe('Common reducer', () => {
  it('Should return initial value', () => {
    const randomAction = { type: 'RANDOM' };

    const state = reducer(
      undefined,
      randomAction as unknown as Parameters<typeof reducer>[1],
    );
    expect(state).toEqual({ cursorPosition: { x: 0, y: 0 } });
  });

  it('Should set new cursor position', () => {
    const initialState = { cursorPosition: { x: 40, y: 60 } };
    const state = reducer(initialState, updateCursorPosition(150, 500));
    expect(state).toEqual({ cursorPosition: { x: 150, y: 500 } });
  });
});
