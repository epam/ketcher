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
import { RootState } from 'state';
import { CoreEditor, MonomerItemType } from 'ketcher-core';
import { ThemeType } from 'theming/defaultTheme';
import { DeepPartial } from '../../types';

interface EditorState {
  isReady: boolean | null;
  activeTool: string;
  editor: CoreEditor | undefined;
  preview: { monomer: undefined | MonomerItemType; style: string };
}

const initialState: EditorState = {
  isReady: null,
  activeTool: 'select',
  editor: undefined,
  preview: { monomer: undefined, style: '' },
};

export const editorSlice: Slice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    init: (state) => {
      state.isReady = false;
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
    createEditor: (
      state,
      action: PayloadAction<{
        theme: DeepPartial<ThemeType>;
        canvas: SVGSVGElement;
      }>,
    ) => {
      state.editor = new CoreEditor({
        theme: action.payload.theme,
        canvas: action.payload.canvas,
      });
    },
    destroyEditor: (state) => {
      state.editor = undefined;
    },
    showPreview: (
      state,
      action: PayloadAction<
        | {
            monomer: undefined | MonomerItemType;
            style: string;
          }
        | undefined
      >,
    ) => {
      state.preview = action.payload || { monomer: undefined, style: '' };
    },
  },
});

export const {
  init,
  initSuccess,
  initFailure,
  selectTool,
  createEditor,
  showPreview,
  destroyEditor,
} = editorSlice.actions;

export const selectEditorIsReady = (state: RootState) => state.editor.isReady;
export const selectShowPreview = (state: RootState) => state.editor.preview;
export const selectEditorActiveTool = (state: RootState) =>
  state.editor.activeTool;

export const selectEditor = (state: RootState): CoreEditor =>
  state.editor.editor;

export const editorReducer = editorSlice.reducer;
