import { vi } from 'vitest';
import { applyTextEdit } from './TextEditorModal';

vi.mock('ketcher-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ketcher-core')>();
  return {
    ...actual,
    EditorHistory: {
      getInstance: () => ({ update: vi.fn() }),
    },
  };
});

const createEditor = () => {
  const command = { operations: [] };
  const manager = {
    addText: vi.fn(() => command),
    updateText: vi.fn(() => command),
    deleteDrawingEntity: vi.fn(() => command),
  };
  const editor = {
    drawingEntitiesManager: manager,
    renderersContainer: { update: vi.fn() },
  };
  return { editor, manager, command };
};

const position = { x: 1, y: 2 } as never;

describe('applyTextEdit', () => {
  it('creates a text at the click position when new content is entered', () => {
    const { editor, manager, command } = createEditor();

    applyTextEdit(editor as never, { position }, 'content');

    expect(manager.addText).toHaveBeenCalledWith('content', position);
    expect(editor.renderersContainer.update).toHaveBeenCalledWith(command);
  });

  it('updates an existing text when its content changes', () => {
    const { editor, manager } = createEditor();
    const text = { content: 'old' } as never;

    applyTextEdit(editor as never, { position, text }, 'new');

    expect(manager.updateText).toHaveBeenCalledWith(text, 'new');
    expect(manager.addText).not.toHaveBeenCalled();
  });

  it('deletes an existing text when its content is cleared', () => {
    const { editor, manager } = createEditor();
    const text = { content: 'old' } as never;

    applyTextEdit(editor as never, { position, text }, '');

    expect(manager.deleteDrawingEntity).toHaveBeenCalledWith(text);
  });

  it('does nothing when a new text is left empty', () => {
    const { editor, manager } = createEditor();

    applyTextEdit(editor as never, { position }, '');

    expect(manager.addText).not.toHaveBeenCalled();
    expect(editor.renderersContainer.update).not.toHaveBeenCalled();
  });
});
