import { AnyAction, Dispatch } from 'redux';
import { CoreEditor, SequenceMode } from 'ketcher-core';
import {
  setActivePresetMonomerGroup,
  setIsEditMode,
  setSequenceSelection,
} from 'state/rna-builder';

const resetRnaBuilderCommon = (dispatch: Dispatch<AnyAction>) => {
  dispatch(setActivePresetMonomerGroup(null));
  dispatch(setIsEditMode(false));
};

export const resetRnaBuilder = (dispatch: Dispatch<AnyAction>) => {
  resetRnaBuilderCommon(dispatch);
};

export const resetRnaBuilderAfterSequenceUpdate = (
  dispatch: Dispatch<AnyAction>,
  editor: CoreEditor,
) => {
  resetRnaBuilderCommon(dispatch);
  dispatch(setSequenceSelection([]));
  editor.events.turnOffSequenceEditInRNABuilderMode.dispatch();
  if (editor.mode instanceof SequenceMode) editor.mode.turnOffEditMode();
};
