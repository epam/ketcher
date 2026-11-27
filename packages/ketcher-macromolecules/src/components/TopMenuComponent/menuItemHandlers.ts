import { CoreEditor } from 'ketcher-core';
import { AppDispatch } from 'state';
import { resetRnaBuilderAfterSequenceUpdate } from 'components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditorExpanded/helpers';

export type MenuItemHandlersDependencies = {
  editor: CoreEditor | undefined;
  dispatch: AppDispatch;
  lastSelectedSelectionMenuItem: string;
  isSequenceEditInRNABuilderMode: boolean;
};

export const createMenuItemHandlers = ({
  editor,
  dispatch,
  lastSelectedSelectionMenuItem,
  isSequenceEditInRNABuilderMode,
}: MenuItemHandlersDependencies) => ({
  undo: () => editor?.events.selectHistory.dispatch('undo'),
  redo: () => editor?.events.selectHistory.dispatch('redo'),
  clear: () => {
    editor?.events.resetSequenceEditMode.dispatch();
    editor?.events.selectTool.dispatch(['clear']);
    editor?.events.selectTool.dispatch([lastSelectedSelectionMenuItem]);
    if (isSequenceEditInRNABuilderMode) {
      resetRnaBuilderAfterSequenceUpdate(dispatch, editor);
    }
  },
  antisenseRnaStrand: () => editor?.events.createAntisenseChain.dispatch(false),
  antisenseDnaStrand: () => editor?.events.createAntisenseChain.dispatch(true),
  'arrange-ring': () => editor?.events.layoutCircular.dispatch(),
  copy: () => editor?.events.copySelectedStructure.dispatch(),
  'copy-ket': () => editor?.events.copySelectedStructureAs.dispatch('ket'),
  'copy-mol': () => editor?.events.copySelectedStructureAs.dispatch('mol'),
  'copy-image': () => editor?.events.copySelectedStructureAs.dispatch('image'),
  cut: () => editor?.events.cutSelectedStructure.dispatch(),
  paste: () => editor?.events.pasteFromClipboard.dispatch(),
});

export type MenuItemHandlers = ReturnType<typeof createMenuItemHandlers>;
export type MenuItemName = keyof MenuItemHandlers;
