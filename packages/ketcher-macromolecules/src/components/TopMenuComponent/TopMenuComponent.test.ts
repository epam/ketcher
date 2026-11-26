import type { EditorHistory } from 'ketcher-core';
import { getUndoRedoDisabledState } from './TopMenuComponent';

describe('getUndoRedoDisabledState', () => {
  it('disables both actions for an empty history', () => {
    const history = {
      historyPointer: 0,
      historyStack: [],
    } as unknown as EditorHistory;

    expect(getUndoRedoDisabledState(history, false)).toEqual({
      undo: true,
      redo: true,
    });
  });

  it('disables undo and enables redo after undoing the only action', () => {
    const history = {
      historyPointer: 0,
      historyStack: [{}],
    } as EditorHistory;

    expect(getUndoRedoDisabledState(history, false)).toEqual({
      undo: true,
      redo: false,
    });
  });

  it('uses menu-wide disablement for both actions', () => {
    const history = {
      historyPointer: 1,
      historyStack: [{}],
    } as EditorHistory;

    expect(getUndoRedoDisabledState(history, true)).toEqual({
      undo: true,
      redo: true,
    });
  });
});
