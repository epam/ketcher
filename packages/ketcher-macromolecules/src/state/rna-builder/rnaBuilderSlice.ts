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
import {
  MonomerItemType,
  MONOMER_CONST,
  LabeledNodesWithPositionInSequence,
} from 'ketcher-core';
import { localStorageWrapper } from 'helpers/localStorage';
import { FAVORITE_ITEMS_UNIQUE_KEYS, MonomerGroups } from 'src/constants';
import {
  deleteCachedCustomRnaPreset,
  setCachedCustomRnaPreset,
  toggleCachedCustomRnaPresetFavorites,
} from 'helpers/manipulateCachedRnaPresets';
import { transformRnaPresetToRnaLabeledPreset } from './rnaBuilderSlice.helper';

export enum RnaBuilderPresetsItem {
  Presets = 'Presets',
}

export type RnaBuilderItem = RnaBuilderPresetsItem | MonomerGroups;

interface IRnaBuilderState {
  activePreset: IRnaPreset | null;
  sequenceSelection: LabeledNodesWithPositionInSequence[] | undefined;
  sequenceSelectionName: string | undefined;
  isSequenceFirstsOnlyNucleoelementsSelected: boolean | undefined;
  activePresetMonomerGroup: {
    groupName: MonomerGroups;
    groupItem: MonomerItemType;
  } | null;
  presetsDefault: IRnaPreset[];
  presetsCustom: IRnaPreset[];
  activeRnaBuilderItem?: RnaBuilderItem | null;
  isEditMode: boolean;
  uniqueNameError: string;
  activePresetForContextMenu: IRnaPreset | null;
}

const initialState: IRnaBuilderState = {
  activePreset: null,
  sequenceSelection: undefined,
  sequenceSelectionName: undefined,
  isSequenceFirstsOnlyNucleoelementsSelected: undefined,
  activePresetMonomerGroup: null,
  presetsDefault: [],
  presetsCustom: [],
  activeRnaBuilderItem: null,
  isEditMode: false,
  uniqueNameError: '',
  activePresetForContextMenu: null,
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
        nameInList: '',
      };
    },
    setActivePreset: (state, action: PayloadAction<IRnaPreset>) => {
      state.activePreset = {
        ...action.payload,
        nameInList: action.payload.name,
      };
    },
    setSequenceSelection: (
      state,
      action: PayloadAction<LabeledNodesWithPositionInSequence[]>,
    ) => {
      state.sequenceSelection = [...action.payload];
    },
    setSequenceSelectionName: (state, action: PayloadAction<string>) => {
      state.sequenceSelectionName = action.payload;
    },
    setIsSequenceFirstsOnlyNucleoelementsSelected: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.isSequenceFirstsOnlyNucleoelementsSelected = action.payload;
    },
    setActivePresetForContextMenu: (
      state,
      action: PayloadAction<IRnaPreset>,
    ) => {
      state.activePresetForContextMenu = action.payload;
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
      } | null>,
    ) => {
      state.activePresetMonomerGroup = action.payload;
    },
    savePreset: (state, action: PayloadAction<IRnaPreset>) => {
      const preset = action.payload;
      const newPreset = { ...preset };

      setCachedCustomRnaPreset(transformRnaPresetToRnaLabeledPreset(newPreset));

      // Save or update preset in Store
      if (newPreset.nameInList) {
        const presetIndexInList = state.presetsCustom.findIndex(
          (presetInList) => presetInList.name === newPreset.nameInList,
        );
        newPreset.nameInList = newPreset.name;
        presetIndexInList === -1
          ? state.presetsCustom.push(newPreset)
          : state.presetsCustom.splice(presetIndexInList, 1, newPreset);
      } else {
        state.presetsCustom.push(newPreset);
      }

      if (!state.activePreset) return;
      state.activePreset.nameInList = newPreset.name;
    },
    deletePreset: (state, action: PayloadAction<IRnaPreset>) => {
      const preset = action.payload;

      deleteCachedCustomRnaPreset(preset.name);

      // Delete preset from Store
      const presetIndexInList = state.presetsCustom.findIndex(
        (presetInList) => presetInList.name === preset.name,
      );
      state.presetsCustom.splice(presetIndexInList, 1);

      if (preset.nameInList) {
        state.activePreset = null;
      }
    },
    setIsEditMode: (state, action: PayloadAction<boolean>) => {
      state.isEditMode = action.payload;
    },
    setUniqueNameError: (state, action: PayloadAction<string>) => {
      state.uniqueNameError = action.payload;
    },
    setDefaultPresets: (
      state: RootState,
      action: PayloadAction<IRnaPreset[]>,
    ) => {
      const defaultNucleotide = action.payload[0];
      if (!defaultNucleotide) {
        return;
      }
      const presetExists = state.presetsDefault.find(
        (item: IRnaPreset) => item.name === defaultNucleotide.name,
      );
      if (presetExists) {
        return;
      }
      state.presetsDefault = action.payload;
    },
    setCustomPresets: (
      state: RootState,
      action: PayloadAction<IRnaPreset[]>,
    ) => {
      state.presetsCustom = action.payload;
    },

    setFavoritePresetsFromLocalStorage: (state: RootState) => {
      const favoritesInLocalStorage: null | unknown =
        localStorageWrapper.getItem(FAVORITE_ITEMS_UNIQUE_KEYS);

      if (!favoritesInLocalStorage || !Array.isArray(favoritesInLocalStorage)) {
        return;
      }

      state.presetsDefault = state.presetsDefault.map((preset) => {
        const uniqueKey = `${preset.name}_${MONOMER_CONST.RNA}`;

        const favoriteItem = favoritesInLocalStorage.find(
          (key) => key === uniqueKey,
        );

        if (favoriteItem) {
          return {
            ...preset,
            favorite: true,
          };
        }

        return preset;
      });
    },

    clearFavorites: (state: RootState) => {
      state.presetsDefault = [];
    },

    togglePresetFavorites: (state, action: PayloadAction<IRnaPreset>) => {
      // Find preset to update in default presets
      const presetIndex = state.presetsDefault.findIndex(
        (presetInList) => presetInList.name === action.payload.name,
      );
      // Find preset to update in custom presets
      const presetCustomIndex = state.presetsCustom.findIndex(
        (presetInList) => presetInList.name === action.payload.name,
      );

      // If updating default preset
      if (presetIndex >= 0) {
        const favorite = state.presetsDefault[presetIndex].favorite;
        state.presetsDefault[presetIndex].favorite = !favorite;
        // If updating custom preset
      } else if (presetCustomIndex >= 0) {
        toggleCachedCustomRnaPresetFavorites(
          state.presetsCustom[presetCustomIndex].name,
        );
        const favorite = state.presetsCustom[presetCustomIndex].favorite;
        state.presetsCustom[presetCustomIndex].favorite = !favorite;
        return;
      }

      const uniquePresetKey = `${action.payload.name}_${MONOMER_CONST.RNA}`;
      const favoriteItemsUniqueKeys = (localStorageWrapper.getItem(
        FAVORITE_ITEMS_UNIQUE_KEYS,
      ) || []) as string[];

      const isKeyAlreadyExisted: boolean = favoriteItemsUniqueKeys.some(
        (targetKey) => targetKey === uniquePresetKey,
      );

      if (isKeyAlreadyExisted) {
        localStorageWrapper.setItem(
          FAVORITE_ITEMS_UNIQUE_KEYS,
          favoriteItemsUniqueKeys.filter(
            (targetKey) => targetKey !== uniquePresetKey,
          ),
        );
      } else {
        favoriteItemsUniqueKeys.push(uniquePresetKey);
        localStorageWrapper.setItem(
          FAVORITE_ITEMS_UNIQUE_KEYS,
          favoriteItemsUniqueKeys,
        );
      }
    },
  },
});

export const selectActiveRnaBuilderItem = (state: RootState): RnaBuilderItem =>
  state.rnaBuilder.activeRnaBuilderItem;

export const selectActivePreset = (state: RootState): IRnaPreset =>
  state.rnaBuilder.activePreset;

export const selectSequenceSelection = (
  state: RootState,
): LabeledNodesWithPositionInSequence[] => state.rnaBuilder.sequenceSelection;

export const selectSequenceSelectionName = (state: RootState): string =>
  state.rnaBuilder.sequenceSelectionName;

export const selectIsSequenceFirstsOnlyNucleotidesSelected = (
  state: RootState,
): boolean => state.rnaBuilder.isSequenceFirstsOnlyNucleoelementsSelected;

export const selectCurrentMonomerGroup = (
  preset: IRnaPreset,
  groupName: MonomerGroups | string,
) => {
  if (!monomerGroupToPresetGroup[groupName] || !preset) return;

  return preset[monomerGroupToPresetGroup[groupName]];
};

export const selectActivePresetMonomerGroup = (state: RootState) =>
  state.rnaBuilder.activePresetMonomerGroup;

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

export const selectUniqueNameError = (state: RootState) => {
  return state.rnaBuilder.uniqueNameError;
};

export const selectIsActivePresetNewAndEmpty = (state: RootState): boolean => {
  const activePreset = state.rnaBuilder.activePreset;
  return (
    activePreset &&
    !activePreset.nameInList &&
    !activePreset.name &&
    !activePreset.sugar &&
    !activePreset.base &&
    !activePreset.phosphate
  );
};

export const selectActivePresetForContextMenu = (state: RootState) => {
  return state.rnaBuilder.activePresetForContextMenu;
};

export const selectPresetsInFavorites = (items: IRnaPreset[]) =>
  items.filter((item) => item.favorite);

// Return custom and default presets
export const selectAllPresets = (
  state,
): Array<IRnaPreset & { favorite: boolean }> => {
  const { presetsDefault = [], presetsCustom = [] } = state.rnaBuilder;
  return [...presetsDefault, ...presetsCustom];
};
export const selectFilteredPresets = (
  state,
): Array<IRnaPreset & { favorite: boolean }> => {
  const { searchFilter } = state.library;
  const presetsAll = selectAllPresets(state);
  return presetsAll.filter((item: IRnaPreset) => {
    const name = item.name?.toLowerCase();
    const sugarName = item.sugar?.label?.toLowerCase();
    const phosphateName = item.phosphate?.label?.toLowerCase();
    const baseName = item.base?.label?.toLowerCase();
    const searchText = searchFilter.toLowerCase();
    const cond =
      name?.includes(searchText) ||
      sugarName?.includes(searchText) ||
      phosphateName?.includes(searchText) ||
      baseName?.includes(searchText);
    return cond;
  });
};

export const {
  setActivePreset,
  setSequenceSelection,
  setSequenceSelectionName,
  setIsSequenceFirstsOnlyNucleoelementsSelected,
  setActivePresetName,
  setActiveRnaBuilderItem,
  setActivePresetMonomerGroup,
  savePreset,
  deletePreset,
  createNewPreset,
  setIsEditMode,
  setUniqueNameError,
  setDefaultPresets,
  setCustomPresets,
  setActivePresetForContextMenu,
  togglePresetFavorites,
  setFavoritePresetsFromLocalStorage,
  clearFavorites,
} = rnaBuilderSlice.actions;

export const rnaBuilderReducer = rnaBuilderSlice.reducer;
