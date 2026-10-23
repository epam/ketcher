import { AnyAction, Dispatch } from 'redux';
import { CoreEditor, type SequenceMode } from 'ketcher-core';
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
  editor: CoreEditor | undefined,
  needToRemoveSelection = true,
) => {
  resetRnaBuilderCommon(dispatch);
  // Always clear the RNA Builder panel's form state (redux sequenceSelection).
  // This is distinct from the canvas selection, which needToRemoveSelection
  // controls below.
  dispatch(setSequenceSelection([]));
  editor?.events.turnOffSequenceEditInRNABuilderMode.dispatch(
    needToRemoveSelection,
  );
  if (editor?.mode?.modeName === 'sequence-layout-mode')
    (editor.mode as SequenceMode).turnOffEditMode(needToRemoveSelection);
};
