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
import {
  CoreEditor,
  IKetIdtAliases,
  MonomerItemType,
  PolymerBond,
  AttachmentPointsToBonds,
  AmbiguousMonomerType,
} from 'ketcher-core';
import { RootState } from 'state';
import { ThemeType } from 'theming/defaultTheme';
import { DeepPartial } from '../../types';

export enum PreviewType {
  Monomer = 'monomer',
  Preset = 'preset',
  Bond = 'bond',
  AmbiguousMonomer = 'ambiguousMonomer',
}

export interface PreviewStyle {
  readonly top?: string;
  readonly left?: string;
  readonly right?: string;
  readonly transform?: string;
}

interface BasePreviewState {
  readonly type: PreviewType;
  readonly style?: PreviewStyle;
}

export interface MonomerPreviewState extends BasePreviewState {
  readonly type: PreviewType.Monomer;
  readonly monomer: MonomerItemType | undefined;
  readonly attachmentPointsToBonds?: AttachmentPointsToBonds;
}

export enum PresetPosition {
  Library = 'library',
  ChainStart = 'chainStart',
  ChainMiddle = 'chainMiddle',
  ChainEnd = 'chainEnd',
}

export interface PresetPreviewState extends BasePreviewState {
  readonly type: PreviewType.Preset;
  readonly monomers: ReadonlyArray<MonomerItemType | undefined>;
  readonly position: PresetPosition;
  readonly name?: string;
  readonly idtAliases?: IKetIdtAliases;
}

export interface BondPreviewState extends BasePreviewState {
  readonly type: PreviewType.Bond;
  readonly polymerBond: PolymerBond;
}

export interface AmbiguousMonomerPreviewState extends BasePreviewState {
  readonly type: PreviewType.AmbiguousMonomer;
  readonly monomer: AmbiguousMonomerType;
  readonly preset?: boolean;
}

type EditorStatePreview =
  | MonomerPreviewState
  | PresetPreviewState
  | BondPreviewState
  | AmbiguousMonomerPreviewState;

// TODO: Looks like we do not use `isReady`. Delete?
interface EditorState {
  isReady: boolean | null;
  activeTool: string;
  editor: CoreEditor | undefined;
  preview: EditorStatePreview;
}

const initialState: EditorState = {
  isReady: null,
  activeTool: 'select',
  editor: undefined,
  preview: {
    type: PreviewType.Monomer,
    monomer: undefined,
    style: {},
  },
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
      state.editor.switchToMicromolecules();
      state.editor = undefined;
    },
    showPreview: (
      state,
      action: PayloadAction<EditorStatePreview | undefined>,
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
export const selectShowPreview = (state: RootState): EditorStatePreview =>
  state.editor.preview;
export const selectEditorActiveTool = (state: RootState) =>
  state.editor.activeTool;
// TODO: Specify the types.
// export const selectEditorIsReady = (state: RootState): EditorState['isReady'] =>
//   state.editor.isReady;
// export const selectEditorActiveTool = (
//   state: RootState,
// ): EditorState['activeTool'] => state.editor.activeTool;

export const selectEditor = (state: RootState): CoreEditor =>
  state.editor.editor;

export const selectIsSequenceEditInRNABuilderMode = (
  state: RootState,
): boolean => state.editor.editor?.isSequenceEditInRNABuilderMode;

export const selectIsSequenceMode = (state: RootState): boolean =>
  state.editor.editor?.isSequenceMode;

export const editorReducer = editorSlice.reducer;
