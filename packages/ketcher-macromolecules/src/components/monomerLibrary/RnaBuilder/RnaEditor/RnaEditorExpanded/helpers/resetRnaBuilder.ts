import { AnyAction, Dispatch } from 'redux';
import { CoreEditor } from 'ketcher-core';
import {
  createNewPreset,
  RnaBuilderPresetsItem,
  setActivePresetMonomerGroup,
  setActiveRnaBuilderItem,
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

// Reset the builder to a pristine "new preset" state while keeping it open and
// editable, so the user can immediately start building again (#4009).
export const resetRnaBuilderToNewPreset = (dispatch: Dispatch<AnyAction>) => {
  dispatch(setActivePresetMonomerGroup(null));
  dispatch(createNewPreset());
  dispatch(setActiveRnaBuilderItem(RnaBuilderPresetsItem.Presets));
  dispatch(setIsEditMode(true));
};

export const resetRnaBuilderAfterSequenceUpdate = (
  dispatch: Dispatch<AnyAction>,
  editor: CoreEditor | undefined,
) => {
  resetRnaBuilderCommon(dispatch);
  dispatch(setSequenceSelection([]));
  editor?.events.turnOffSequenceEditInRNABuilderMode.dispatch();
  if (editor?.mode?.modeName === 'sequence-layout-mode')
    (editor.mode as unknown as { turnOffEditMode(): void }).turnOffEditMode();
};
