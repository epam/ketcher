import { EditorHistory } from 'application/editor/EditorHistory';
import { hotkeysConfiguration } from 'application/editor/editorEvents';
import { ToolName } from 'application/editor/tools/types';

describe('editor hotkeys configuration', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createEditor = ({
    hoveredMonomer = null,
    selectedEntities = [],
    isSequenceMode = false,
  }: {
    hoveredMonomer?: { hovered: boolean } | null;
    selectedEntities?: Array<[number, unknown]>;
    isSequenceMode?: boolean;
  } = {}) => {
    const deleteDrawingEntity = jest.fn();
    const recalculateAntisenseChains = jest.fn();
    const renderUpdate = jest.fn();
    const selectToolDispatch = jest.fn();
    const selectEntitiesDispatch = jest.fn();

    const monomers = new Map<number, { hovered: boolean }>();
    if (hoveredMonomer) {
      monomers.set(1, hoveredMonomer);
    }

    const editor = {
      isSequenceMode,
      drawingEntitiesManager: {
        monomers,
        selectedEntities,
        deleteDrawingEntity,
        recalculateAntisenseChains,
      },
      renderersContainer: {
        update: renderUpdate,
      },
      events: {
        selectTool: {
          dispatch: selectToolDispatch,
        },
        selectEntities: {
          dispatch: selectEntitiesDispatch,
        },
      },
    };

    return {
      editor,
      deleteDrawingEntity,
      recalculateAntisenseChains,
      renderUpdate,
      selectToolDispatch,
      selectEntitiesDispatch,
    };
  };

  it('selects the single bond tool with tool name options', () => {
    const { editor, selectToolDispatch } = createEditor();

    hotkeysConfiguration.bondSingle.handler(editor as never);

    expect(selectToolDispatch).toHaveBeenCalledWith([
      ToolName.bondSingle,
      { toolName: ToolName.bondSingle },
    ]);
  });

  it('deletes a hovered monomer instead of switching to the erase tool', () => {
    const modelChanges = {
      merge: jest.fn(),
    };
    const antisenseChanges = {};
    const hoveredMonomer = {
      hovered: true,
    };
    const historyUpdate = jest.fn();
    jest
      .spyOn(EditorHistory, 'getInstance')
      .mockReturnValue({ update: historyUpdate } as never);

    const {
      editor,
      deleteDrawingEntity,
      recalculateAntisenseChains,
      renderUpdate,
      selectToolDispatch,
      selectEntitiesDispatch,
    } = createEditor({
      hoveredMonomer,
    });
    deleteDrawingEntity.mockReturnValue(modelChanges);
    recalculateAntisenseChains.mockReturnValue(antisenseChanges);

    hotkeysConfiguration.erase.handler(editor as never);

    expect(deleteDrawingEntity).toHaveBeenCalledWith(
      hoveredMonomer,
      true,
      true,
    );
    expect(modelChanges.merge).toHaveBeenCalledWith(antisenseChanges);
    expect(historyUpdate).toHaveBeenCalledWith(modelChanges);
    expect(renderUpdate).toHaveBeenCalledWith(modelChanges);
    expect(selectEntitiesDispatch).toHaveBeenCalledWith([]);
    expect(selectToolDispatch).not.toHaveBeenCalled();
  });

  it('keeps selection deletion behavior when entities are selected', () => {
    const { editor, deleteDrawingEntity, selectToolDispatch } = createEditor({
      hoveredMonomer: {
        hovered: true,
      },
      selectedEntities: [[1, { id: 1 }]],
    });

    hotkeysConfiguration.erase.handler(editor as never);

    expect(deleteDrawingEntity).not.toHaveBeenCalled();
    expect(selectToolDispatch).toHaveBeenNthCalledWith(1, [ToolName.erase]);
    expect(selectToolDispatch).toHaveBeenNthCalledWith(2, [
      ToolName.selectRectangle,
    ]);
  });
});
