import { CoreEditor, EditorHistory } from 'application/editor';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';
import { Command } from 'domain/entities/Command';

describe('EditorHistory', () => {
  let canvas;
  let editor: CoreEditor;
  let history: EditorHistory;
  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    editor = new CoreEditor({
      theme: {},
      canvas,
      renderersContainer: createRenderersManager(),
    });
    history = EditorHistory.getInstance(editor);
  });

  afterEach(() => {
    history.destroy();
  });

  it('should be a singletone', () => {
    const historyInstance2 = EditorHistory.getInstance(editor);
    expect(history).toBe(historyInstance2);
  });

  it('should create another instance after destroy', () => {
    history.destroy();
    const historyInstance2 = EditorHistory.getInstance(editor);
    expect(history).not.toBe(historyInstance2);
  });

  it('keeps histories scoped to their editor', () => {
    const otherHistory = EditorHistory.getInstance({} as CoreEditor);
    expect(otherHistory).not.toBe(history);
    expect(EditorHistory.getInstance(editor)).toBe(history);
    otherHistory.destroy();
  });

  it('should add commands into history stack', () => {
    history.update(new Command());
    history.update(new Command());
    expect(history.historyStack.length).toEqual(2);
  });

  it('should move pointer when undo/redo methods called', () => {
    history.update(new Command());
    history.update(new Command());
    expect(history.historyPointer).toEqual(2);
    history.redo();
    expect(history.historyPointer).toEqual(2);
    history.undo();
    expect(history.historyPointer).toEqual(1);
    history.undo();
    expect(history.historyPointer).toEqual(0);
    history.undo();
    expect(history.historyPointer).toEqual(0);
    history.redo();
    expect(history.historyPointer).toEqual(1);
  });

  it('notifies layout subscribers after restoring the mode on undo and redo', () => {
    editor.events.selectMode.dispatch('flex-layout-mode');
    editor.events.selectMode.dispatch('snake-layout-mode');
    const observedModes: string[] = [];
    const onLayoutModeChange = (modeName: string) => {
      observedModes.push(editor.mode.modeName);
      expect(editor.mode.modeName).toBe(modeName);
    };
    editor.events.layoutModeChange.add(onLayoutModeChange);

    try {
      history.undo();
      expect(editor.mode.modeName).toBe('flex-layout-mode');
      history.redo();
      expect(editor.mode.modeName).toBe('snake-layout-mode');
      expect(observedModes).toEqual(['flex-layout-mode', 'snake-layout-mode']);
    } finally {
      editor.events.layoutModeChange.remove(onLayoutModeChange);
    }
  });

  it('should have stack maximum size equal 32 commands', () => {
    for (let i = 0; i < 40; i++) {
      history.update(new Command());
    }
    expect(history.historyStack.length).toEqual(32);
    expect(history.historyPointer).toEqual(32);
  });
});
