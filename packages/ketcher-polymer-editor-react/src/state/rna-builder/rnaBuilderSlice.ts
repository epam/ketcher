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

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';
import { RootState } from 'state';
import { MonomerGroups } from '../../constants';
import { MonomerItemType } from 'ketcher-core';

export enum RnaBuilderPresetsItem {
  Presets = 'Presets',
}

export type RnaBuilderItem = RnaBuilderPresetsItem | MonomerGroups;

interface IRnaBuilderState {
  activePreset: IRnaPreset | null;
  presets: IRnaPreset[];
  activeRnaBuilderItem?: RnaBuilderItem | null;
  isEditMode: boolean;
  hasUniqueNameError: boolean;
}

const initialState: IRnaBuilderState = {
  activePreset: null,
  presets: [],
  activeRnaBuilderItem: null,
  isEditMode: false,
  hasUniqueNameError: false,
};
export const monomerGroupToPresetGroup = {
  [MonomerGroups.BASES]: 'base',
  [MonomerGroups.SUGARS]: 'sugar',
  [MonomerGroups.PHOSPHATES]: 'phosphate',
};

export const rnaBuilderSlice = createSlice({
  name: 'rna-builder',
  initialState,
  reducers: {
    createNewPreset: (state) => {
      state.activePreset = {
        base: undefined,
        sugar: undefined,
        phosphate: undefined,
        name: '',
      };
    },
    setActivePreset: (state, action: PayloadAction<IRnaPreset>) => {
      state.activePreset = {
        ...action.payload,
        presetInList: action.payload,
      };
    },
    setActivePresetName: (state, action: PayloadAction<string>) => {
      state.activePreset!.name = action.payload;
    },
    setActiveRnaBuilderItem: (
      state,
      action: PayloadAction<RnaBuilderItem | null>,
    ) => {
      state.activeRnaBuilderItem = action.payload;
    },
    setActivePresetMonomerGroup: (
      state,
      action: PayloadAction<{
        groupName: MonomerGroups;
        groupItem: MonomerItemType;
      }>,
    ) => {
      state.activePreset![monomerGroupToPresetGroup[action.payload.groupName]] =
        action.payload.groupItem;
    },
    savePreset: (state, action: PayloadAction<IRnaPreset>) => {
      const preset = action.payload;
      const newPreset = { ...preset };

      if (preset.presetInList) {
        const presetIndexInList = state.presets.findIndex(
          (presetInList) => presetInList.name === preset.presetInList?.name,
        );
        state.presets.splice(presetIndexInList, 1, newPreset);
      } else {
        state.presets.push(newPreset);
      }
      if (!state.activePreset) return;
      state.activePreset.presetInList = newPreset;
    },
    setIsEditMode: (state, action: PayloadAction<boolean>) => {
      state.isEditMode = action.payload;
    },
    setHasUniqueNameError: (state, action: PayloadAction<boolean>) => {
      state.hasUniqueNameError = action.payload;
    },
    setDefaultPresets: (
      state: RootState,
      action: PayloadAction<IRnaPreset[]>,
    ) => {
      const defaultNucleotide = action.payload[0];
      if (!defaultNucleotide) {
        return;
      }
      const presetExists = state.presets.find(
        (item: IRnaPreset) => item.name === defaultNucleotide.name,
      );
      if (presetExists) {
        return;
      }
      state.presets = action.payload;
    },
  },
});

export const selectActiveRnaBuilderItem = (state: RootState): RnaBuilderItem =>
  state.rnaBuilder.activeRnaBuilderItem;

export const selectActivePreset = (state: RootState): IRnaPreset =>
  state.rnaBuilder.activePreset;

export const selectPresets = (state: RootState): IRnaPreset[] => {
  return state.rnaBuilder.presets;
};

export const selectActivePresetMonomerGroup = (
  preset: IRnaPreset,
  groupName: MonomerGroups | string,
) => {
  if (!monomerGroupToPresetGroup[groupName] || !preset) return;

  return preset[monomerGroupToPresetGroup[groupName]];
};

export const selectIsPresetReadyToSave = (preset: IRnaPreset): boolean => {
  return Boolean(
    (preset.phosphate || preset.sugar || preset.base) && preset.name,
  );
};

export const selectIsEditMode = (state: RootState): boolean => {
  return state.rnaBuilder.isEditMode;
};
export const selectPresetFullName = (preset: IRnaPreset): string => {
  if (!preset) return '';
  const sugar = preset.sugar?.props.MonomerName || '';
  const base = preset.base?.props.MonomerName || '';
  const phosphate = preset.phosphate?.props.MonomerName || '';
  let fullName = sugar;

  if (sugar && phosphate) {
    fullName += `(${base})`;
  } else if ((sugar || phosphate) && base) {
    fullName += `(${base})`;
  } else {
    fullName += base;
  }

  fullName += phosphate;

  return fullName;
};

export const selectHasUniqueNameError = (state: RootState) => {
  return state.rnaBuilder.hasUniqueNameError;
};

export const {
  setActivePreset,
  setActivePresetName,
  setActiveRnaBuilderItem,
  setActivePresetMonomerGroup,
  savePreset,
  createNewPreset,
  setIsEditMode,
  setHasUniqueNameError,
  setDefaultPresets,
} = rnaBuilderSlice.actions;

export const rnaBuilderReducer = rnaBuilderSlice.reducer;
