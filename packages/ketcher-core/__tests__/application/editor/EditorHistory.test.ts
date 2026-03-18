import { CoreEditor, EditorHistory } from 'application/editor';
import { createPolymerEditorCanvas } from '../../helpers/dom';
import { Command } from 'domain/entities/Command';

describe('EditorHistory', () => {
  let canvas;
  let editor: CoreEditor;
  let history: EditorHistory;
  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    editor = new CoreEditor({ theme: {}, canvas });
    history = new EditorHistory(editor);
  });

  afterEach(() => {
    history.destroy();
  });

  it('should be a singletone', () => {
    const historyInstance2 = new EditorHistory(editor);
    expect(history).toBe(historyInstance2);
  });

  it('should create another instance after destroy', () => {
    history.destroy();
    const historyInstance2 = new EditorHistory(editor);
    expect(history).not.toBe(historyInstance2);
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

  it('should have stack maximum size equal 32 commands', () => {
    for (let i = 0; i < 40; i++) {
      history.update(new Command());
    }
    expect(history.historyStack.length).toEqual(32);
    expect(history.historyPointer).toEqual(32);
  });
});
