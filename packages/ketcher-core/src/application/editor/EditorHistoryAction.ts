import { Action } from './actions/action';
import type { Command } from 'domain/entities/Command';

/**
 * Adapts macro commands and mode transitions to the micro editor's reversible
 * actions, so both editors use the same bounded undo/redo stack.
 */
export class EditorHistoryAction extends Action {
  constructor(
    private readonly undo: () => void,
    private readonly redo: () => void,
    public readonly command?: Command,
  ) {
    super();
  }

  perform(): Action {
    this.undo();
    return new EditorHistoryAction(this.redo, this.undo, this.command);
  }

  isDummy() {
    return false;
  }
}
