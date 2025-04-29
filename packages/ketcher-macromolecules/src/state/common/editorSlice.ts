/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';
import { CoreEditor, LayoutMode, modesMap } from 'ketcher-core';
import { EditorStatePreview, RootState } from 'state';
import { PreviewType } from 'state/types';
import { ThemeType } from 'theming/defaultTheme';
import { DeepPartial } from '../../types';
import { PresetPosition } from 'ketcher-react';

// TODO: Looks like we do not use `isReady`. Delete?
interface EditorState {
  ketcherId: string;
  isReady: boolean | null;
  activeTool: string;
  editor: CoreEditor | undefined;
  editorLayoutMode: LayoutMode | undefined;
  preview: EditorStatePreview;
  position: PresetPosition | undefined;
  isContextMenuActive: boolean;
}

const initialState: EditorState = {
  ketcherId: '',
  isReady: null,
  activeTool: 'select',
  editor: undefined,
  editorLayoutMode: undefined,
  preview: {
    type: PreviewType.Monomer,
    monomer: undefined,
    style: {},
  },
  position: undefined,
  isContextMenuActive: false,
};

export const editorSlice: Slice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    init: (state) => {
      state.isReady = false;
    },
    initKetcherId: (state, action: PayloadAction<string>) => {
      state.ketcherId = action.payload;
    },
    initSuccess: (state) => {
      state.isReady = true;
    },
    initFailure: (state) => {
      state.isReady = false;
    },
    selectTool: (state, action: PayloadAction<string>) => {
      state.activeTool = action.payload;
    },
    setPosition: (state, action: PayloadAction<PresetPosition>) => {
      state.position = action.payload;
    },

    createEditor: (
      state,
      action: PayloadAction<{
        ketcherId: string;
        theme: DeepPartial<ThemeType>;
        canvas: SVGSVGElement;
        monomersLibraryUpdate?: string | JSON;
      }>,
    ) => {
      state.editor = new CoreEditor({
        theme: action.payload.theme,
        canvas: action.payload.canvas,
        mode: state.editorLayoutMode
          ? new modesMap[state.editorLayoutMode]()
          : undefined,
        monomersLibraryUpdate: action.payload.monomersLibraryUpdate,
      });
    },
    destroyEditor: (state) => {
      state.editorLayoutMode = state.editor.mode.modeName;
      state.editor.switchToMicromolecules();
      state.editor = undefined;
    },
    showPreview: (
      state,
      action: PayloadAction<EditorStatePreview | undefined>,
    ) => {
      state.preview = action.payload || { monomer: undefined, style: '' };
    },
    setContextMenuActive: (state, action: PayloadAction<boolean>) => {
      state.isContextMenuActive = action.payload;
    },
  },
});

export const {
  init,
  initSuccess,
  initFailure,
  initKetcherId,
  selectTool,
  setPosition,
  createEditor,
  destroyEditor,
  showPreview,
  setContextMenuActive,
} = editorSlice.actions;

export const selectEditorIsReady = (state: RootState) => state.editor.isReady;
export const selectShowPreview = (state: RootState): EditorStatePreview =>
  state.editor.preview;
export const selectEditorActiveTool = (state: RootState) =>
  state.editor.activeTool;
export const selectEditorPosition = (
  state: RootState,
): PresetPosition | undefined => state.editor.position;
// TODO: Specify the types.
// export const selectEditorIsReady = (state: RootState): EditorState['isReady'] =>
//   state.editor.isReady;
// export const selectEditorActiveTool = (
//   state: RootState,
// ): EditorState['activeTool'] => state.editor.activeTool;

export const selectKetcherId = (state: RootState): string => {
  return state.editor.ketcherId;
};

export const selectEditor = (state: RootState): CoreEditor =>
  state.editor.editor;

export const selectIsSequenceEditInRNABuilderMode = (
  state: RootState,
): boolean => state.editor.editor?.isSequenceEditInRNABuilderMode;

export const selectIsSequenceMode = (state: RootState): boolean =>
  state.editor.editor?.isSequenceMode;

export const selectIsSequenceSyncEditMode = (state: RootState): boolean =>
  state.editor.editor?.isSequenceSyncEditMode;

export const selectEditorLayoutMode = (state: RootState): LayoutMode => {
  return state.editor.editorLayoutMode;
};

export const selectIsHandToolSelected = (state: RootState) =>
  state.editor.editor?.isHandToolSelected;

export const hasAntisenseChains = (state: RootState): CoreEditor =>
  state.editor.editor?.drawingEntitiesManager?.hasAntisenseChains;

export const selectIsContextMenuActive = (state: RootState): boolean =>
  state.editor.isContextMenuActive;

export const editorReducer = editorSlice.reducer;
