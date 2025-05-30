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

import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
  Slice,
} from '@reduxjs/toolkit';
import {
  CoreEditor,
  type LayoutMode,
  SettingsManager,
  type EditorLineLength,
  type SingleChainMacromoleculeProperties,
} from 'ketcher-core';
import { EditorStatePreview, RootState } from 'state';
import { PreviewType } from 'state/types';
import { ThemeType } from 'theming/defaultTheme';
import { DeepPartial } from '../../types';
import { PresetPosition } from 'ketcher-react';

export enum MolarMeasurementUnit {
  nanoMol = 'nM',
  microMol = 'μM',
  milliMol = 'mM',
}

export const molarMeasurementUnitToNumber = {
  [MolarMeasurementUnit.nanoMol]: 10 ** 9,
  [MolarMeasurementUnit.microMol]: 10 ** 6,
  [MolarMeasurementUnit.milliMol]: 10 ** 3,
};

interface EditorState {
  activeTool: string;
  editor: CoreEditor | undefined;
  editorLayoutMode: LayoutMode | undefined;
  editorLineLength: EditorLineLength;
  preview: EditorStatePreview;
  position: PresetPosition | undefined;
  isContextMenuActive: boolean;
  isMacromoleculesPropertiesWindowOpened: boolean;
  macromoleculesProperties: SingleChainMacromoleculeProperties[] | undefined;
  unipositiveIonsMeasurementUnit: MolarMeasurementUnit;
  oligonucleotidesMeasurementUnit: MolarMeasurementUnit;
}

const initialState: EditorState = {
  activeTool: 'select',
  editor: undefined,
  editorLayoutMode: undefined,
  editorLineLength: SettingsManager.editorLineLength,
  preview: {
    type: PreviewType.Monomer,
    monomer: undefined,
    style: {},
  },
  position: undefined,
  isContextMenuActive: false,
  isMacromoleculesPropertiesWindowOpened: false,
  macromoleculesProperties: undefined,
  unipositiveIonsMeasurementUnit: MolarMeasurementUnit.milliMol,
  oligonucleotidesMeasurementUnit: MolarMeasurementUnit.microMol,
};

export const updateEditorLineLength = createAsyncThunk(
  'editor/updateEditorLineLength',
  (editorLineLength: EditorLineLength) => {
    SettingsManager.editorLineLength = editorLineLength;
    return editorLineLength;
  },
);

export const editorSlice: Slice<EditorState> = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    selectTool: (state, action: PayloadAction<string>) => {
      state.activeTool = action.payload;
    },
    setPosition: (state, action: PayloadAction<PresetPosition>) => {
      state.position = action.payload;
    },
    createEditor: (
      state,
      action: PayloadAction<{
        theme: DeepPartial<ThemeType>;
        canvas: SVGSVGElement;
        monomersLibraryUpdate?: string | JSON;
        onInit?: (editor: CoreEditor) => void;
      }>,
    ) => {
      const editor = new CoreEditor({
        theme: action.payload.theme,
        canvas: action.payload.canvas,
        monomersLibraryUpdate: action.payload.monomersLibraryUpdate,
      });

      // TODO: Figure out proper typing here and below
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      state.editor = editor;
      action.payload.onInit?.(editor);
    },
    destroyEditor: (state) => {
      state.editorLayoutMode = state.editor?.mode.modeName;
      state.editor?.switchToMicromolecules();
      state.editor = undefined;
    },
    showPreview: (
      state,
      action: PayloadAction<EditorStatePreview | undefined>,
    ) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      state.preview = action.payload || { monomer: undefined, style: '' };
    },
    setContextMenuActive: (state, action: PayloadAction<boolean>) => {
      state.isContextMenuActive = action.payload;
    },
    setMacromoleculesPropertiesWindowVisibility: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.isMacromoleculesPropertiesWindowOpened = action.payload;
    },
    toggleMacromoleculesPropertiesWindowVisibility: (state) => {
      state.isMacromoleculesPropertiesWindowOpened =
        !state.isMacromoleculesPropertiesWindowOpened;
    },
    setMacromoleculesProperties: (
      state,
      action: PayloadAction<SingleChainMacromoleculeProperties[]>,
    ) => {
      state.macromoleculesProperties = action.payload;
    },
    setUnipositiveIonsMeasurementUnit: (
      state,
      action: PayloadAction<MolarMeasurementUnit>,
    ) => {
      state.unipositiveIonsMeasurementUnit = action.payload;
    },
    setOligonucleotidesMeasurementUnit: (
      state,
      action: PayloadAction<MolarMeasurementUnit>,
    ) => {
      state.oligonucleotidesMeasurementUnit = action.payload;
    },
  },
  extraReducers: {
    [updateEditorLineLength.fulfilled.type]: (
      state,
      action: PayloadAction<Record<LayoutMode, number>>,
    ) => {
      state.editorLineLength = { ...state.editorLineLength, ...action.payload };
    },
  },
});

export const {
  selectTool,
  setPosition,
  createEditor,
  destroyEditor,
  showPreview,
  setContextMenuActive,
  setMacromoleculesPropertiesWindowVisibility,
  toggleMacromoleculesPropertiesWindowVisibility,
  setMacromoleculesProperties,
  setUnipositiveIonsMeasurementUnit,
  setOligonucleotidesMeasurementUnit,
} = editorSlice.actions;

export const selectShowPreview = (state: RootState): EditorStatePreview =>
  state.editor.preview;
export const selectEditorActiveTool = (state: RootState) =>
  state.editor.activeTool;
export const selectEditorPosition = (
  state: RootState,
): PresetPosition | undefined => state.editor.position;
// TODO: Specify the types.
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

export const selectIsMacromoleculesPropertiesWindowOpened = (
  state: RootState,
) => state.editor.isMacromoleculesPropertiesWindowOpened;

export const selectMacromoleculesProperties = (state: RootState) =>
  state.editor.macromoleculesProperties;

export const selectUnipositiveIonsMeasurementUnit = (state: RootState) =>
  state.editor.unipositiveIonsMeasurementUnit;

export const selectOligonucleotidesMeasurementUnit = (state: RootState) =>
  state.editor.oligonucleotidesMeasurementUnit;

export const selectMonomers = (state: RootState) =>
  state.editor.editor?.drawingEntitiesManager?.monomers;

export const selectEditorLineLength = (state: RootState): EditorLineLength =>
  state.editor.editorLineLength;

export const editorReducer = editorSlice.reducer;
