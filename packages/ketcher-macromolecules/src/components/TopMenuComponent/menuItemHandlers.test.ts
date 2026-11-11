import { CoreEditor } from 'ketcher-core';
import { AppDispatch } from 'state';
import { resetRnaBuilderAfterSequenceUpdate } from 'components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditorExpanded/helpers';
import { createMenuItemHandlers, MenuItemName } from './menuItemHandlers';

jest.mock(
  'components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditorExpanded/helpers',
  () => ({
    resetRnaBuilderAfterSequenceUpdate: jest.fn(),
  }),
);

const eventNames = [
  'selectHistory',
  'resetSequenceEditMode',
  'selectTool',
  'createAntisenseChain',
  'layoutCircular',
  'copySelectedStructure',
  'copySelectedStructureAs',
  'cutSelectedStructure',
  'pasteFromClipboard',
] as const;

type EventName = (typeof eventNames)[number];

const createEditorMock = () => {
  const events = Object.fromEntries(
    eventNames.map((eventName) => [eventName, { dispatch: jest.fn() }]),
  ) as Record<EventName, { dispatch: jest.Mock }>;

  return { editor: { events } as unknown as CoreEditor, events };
};

const createHandlers = (
  overrides: { isSequenceEditInRNABuilderMode?: boolean } = {},
) => {
  const { editor, events } = createEditorMock();
  const dispatch = jest.fn() as unknown as AppDispatch;
  const handlers = createMenuItemHandlers({
    editor,
    dispatch,
    lastSelectedSelectionMenuItem: 'select-rectangle',
    isSequenceEditInRNABuilderMode: false,
    ...overrides,
  });

  return { handlers, events, editor, dispatch };
};

describe('createMenuItemHandlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each<[MenuItemName, EventName, unknown[]]>([
    ['undo', 'selectHistory', ['undo']],
    ['redo', 'selectHistory', ['redo']],
    ['antisenseRnaStrand', 'createAntisenseChain', [false]],
    ['antisenseDnaStrand', 'createAntisenseChain', [true]],
    ['arrange-ring', 'layoutCircular', []],
    ['copy', 'copySelectedStructure', []],
    ['copy-ket', 'copySelectedStructureAs', ['ket']],
    ['copy-mol', 'copySelectedStructureAs', ['mol']],
    ['copy-image', 'copySelectedStructureAs', ['image']],
    ['cut', 'cutSelectedStructure', []],
    ['paste', 'pasteFromClipboard', []],
  ])('"%s" dispatches %s with %j', (name, eventName, args) => {
    const { handlers, events } = createHandlers();

    handlers[name]();

    expect(events[eventName].dispatch).toHaveBeenCalledTimes(1);
    expect(events[eventName].dispatch).toHaveBeenCalledWith(...args);
  });

  describe('clear', () => {
    it('resets the canvas and reselects the last selection tool', () => {
      const { handlers, events } = createHandlers();

      handlers.clear();

      expect(events.resetSequenceEditMode.dispatch).toHaveBeenCalledTimes(1);
      expect(events.selectTool.dispatch).toHaveBeenNthCalledWith(1, ['clear']);
      expect(events.selectTool.dispatch).toHaveBeenNthCalledWith(2, [
        'select-rectangle',
      ]);
    });

    it('does not reset the RNA builder outside of sequence edit mode', () => {
      const { handlers } = createHandlers();

      handlers.clear();

      expect(resetRnaBuilderAfterSequenceUpdate).not.toHaveBeenCalled();
    });

    it('resets the RNA builder in sequence edit mode', () => {
      const { handlers, dispatch, editor } = createHandlers({
        isSequenceEditInRNABuilderMode: true,
      });

      handlers.clear();

      expect(resetRnaBuilderAfterSequenceUpdate).toHaveBeenCalledWith(
        dispatch,
        editor,
      );
    });
  });

  it('does not throw when there is no editor yet', () => {
    const handlers = createMenuItemHandlers({
      editor: undefined,
      dispatch: jest.fn() as unknown as AppDispatch,
      lastSelectedSelectionMenuItem: 'select-rectangle',
      isSequenceEditInRNABuilderMode: false,
    });

    expect(() => handlers.copy()).not.toThrow();
    expect(() => handlers.paste()).not.toThrow();
  });
});
