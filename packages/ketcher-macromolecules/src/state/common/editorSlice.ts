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
  type LayoutMode,
  SettingsManager,
  type EditorLineLength,
  type SingleChainMacromoleculeProperties,
} from 'ketcher-core';
import { EditorStatePreview, RootState } from 'state';
import { PreviewType } from 'state/types';
import { ThemeType } from 'theming/defaultTheme';
import { DeepPartial } from '../../types';
import { PresetPosition, IndigoProvider } from 'ketcher-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

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

interface AppMeta {
  buildDate: string;
  indigoVersion: string;
  indigoMachine: string;
  version: string;
}

interface EditorState {
  ketcherId: string;
  isReady: boolean | null;
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
  unipositiveIonsValue: number;
  oligonucleotidesValue: number;
  app: AppMeta;
}

const initialState: EditorState = {
  ketcherId: '',
  isReady: null,
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
  unipositiveIonsValue: 140,
  oligonucleotidesValue: 200,
  app: {
    buildDate: process.env.BUILD_DATE || '',
    indigoVersion: process.env.INDIGO_VERSION || '',
    indigoMachine: process.env.INDIGO_MACHINE || '',
    version: process.env.VERSION || '',
  },
};

export const editorSlice: Slice<EditorState> = createSlice({
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
      state.editor?.destroy();
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
    setEditorLineLength: (
      state,
      action: PayloadAction<Partial<EditorLineLength>>,
    ) => {
      state.editorLineLength = {
        ...state.editorLineLength,
        ...action.payload,
      };
    },
    setUnipositiveIonsValue: (state, action: PayloadAction<number>) => {
      state.unipositiveIonsValue = action.payload;
    },
    setOligonucleotidesValue: (state, action: PayloadAction<number>) => {
      state.oligonucleotidesValue = action.payload;
    },
    setAppMeta: (state, action: PayloadAction<AppMeta>) => {
      state.app = action.payload;
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
  setMacromoleculesPropertiesWindowVisibility,
  toggleMacromoleculesPropertiesWindowVisibility,
  setMacromoleculesProperties,
  setUnipositiveIonsMeasurementUnit,
  setOligonucleotidesMeasurementUnit,
  setEditorLineLength,
  setUnipositiveIonsValue,
  setOligonucleotidesValue,
  setAppMeta,
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

export const selectKetcherId = (state: RootState): string => {
  return state.editor.ketcherId;
};

export const selectEditor = (state: RootState): CoreEditor | undefined =>
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

export const selectUnipositiveIonsValue = (state: RootState) =>
  state.editor.unipositiveIonsValue;

export const selectOligonucleotidesValue = (state: RootState) =>
  state.editor.oligonucleotidesValue;

export const selectMonomers = (state: RootState) =>
  state.editor.editor?.drawingEntitiesManager?.monomers;

export const selectEditorLineLength = (state: RootState): EditorLineLength =>
  state.editor.editorLineLength;

export const editorReducer = editorSlice.reducer;

export function useIndigoVersionToRedux() {
  const dispatch = useDispatch();
  const app = useSelector((state: RootState) => state.editor?.app || {});

  useEffect(() => {
    async function fetchIndigoInfo() {
      const indigo = IndigoProvider.getIndigo();
      if (indigo && indigo.info) {
        try {
          const info = await indigo.info();
          dispatch(
            setAppMeta({
              ...app,
              indigoVersion: info.indigoVersion || '',
            }),
          );
        } catch (e) {
          // ignore
        }
      }
    }
    fetchIndigoInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);
}
