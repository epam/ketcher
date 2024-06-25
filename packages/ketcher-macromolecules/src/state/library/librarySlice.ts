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
  createSelector,
  createSlice,
  PayloadAction,
  Slice,
} from '@reduxjs/toolkit';
import { Group } from 'components/monomerLibrary/monomerLibraryList/types';

import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';
import { KetMonomerClass, MonomerItemType, SdfItem } from 'ketcher-core';
import {
  LibraryNameType,
  FAVORITE_ITEMS_UNIQUE_KEYS,
  NoNaturalAnalogueGroupTitle,
  NoNaturalAnalogueGroupCode,
} from 'src/constants';
import { RootState } from 'state';
import { localStorageWrapper } from 'helpers/localStorage';

interface LibraryState {
  monomers: Group[];
  favorites: { [key: string]: Group };
  searchFilter: string;
  selectedTabIndex: number;
}

const initialState: LibraryState = {
  monomers: [],
  favorites: {},
  searchFilter: '',
  selectedTabIndex: 1,
};

export function getMonomerUniqueKey(monomer: MonomerItemType) {
  return `${monomer.props.MonomerName}___${monomer.props.Name}`;
}

export function getPresetUniqueKey(preset: IRnaPreset) {
  return `${preset.name}_${preset.base?.label || '.'}_${
    preset.sugar?.label || '.'
  }_${preset.phosphate?.label || '.'}`;
}

export const librarySlice: Slice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    loadMonomerLibrary: (
      state: RootState,
      action: PayloadAction<SdfItem[]>,
    ) => {
      const clonedMonomers = action.payload.map((monomer) => {
        return {
          ...monomer,
          props: { ...monomer.props },
        };
      });

      state.monomers = clonedMonomers;
    },

    setFavoriteMonomersFromLocalStorage: (state: RootState) => {
      const localFavorites = {};

      const favoritesInLocalStorage: null | string =
        localStorageWrapper.getItem(FAVORITE_ITEMS_UNIQUE_KEYS);

      if (!favoritesInLocalStorage || !Array.isArray(favoritesInLocalStorage)) {
        return;
      }

      state.monomers.forEach((monomer: MonomerItemType) => {
        const uniqueKey: string = getMonomerUniqueKey(monomer);
        const favoriteItem = favoritesInLocalStorage.find(
          (key) => key === uniqueKey,
        );

        if (!favoriteItem) {
          return;
        }

        localFavorites[uniqueKey] = {
          ...monomer,
          favorite: true,
        };
      });

      state.favorites = localFavorites;
    },

    clearFavorites: (state: RootState) => {
      state.favorites = {};
    },

    toggleMonomerFavorites: (
      state: RootState,
      action: PayloadAction<MonomerItemType>,
    ) => {
      const key: string = getMonomerUniqueKey(action.payload);

      const favoriteItemsUniqueKeys = (localStorageWrapper.getItem(
        FAVORITE_ITEMS_UNIQUE_KEYS,
      ) || []) as string[];

      if (state.favorites[key]) {
        delete state.favorites[key];
        localStorageWrapper.setItem(
          FAVORITE_ITEMS_UNIQUE_KEYS,
          favoriteItemsUniqueKeys.filter((targetKey) => targetKey !== key),
        );
      } else {
        state.favorites[key] = { ...action.payload, favorite: true };
        favoriteItemsUniqueKeys.push(key);
        localStorageWrapper.setItem(
          FAVORITE_ITEMS_UNIQUE_KEYS,
          favoriteItemsUniqueKeys,
        );
      }
    },
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.searchFilter = action.payload;
    },
    setSelectedTabIndex: (state, action: PayloadAction<number>) => {
      state.selectedTabIndex = action.payload;
    },
  },
});

export const getSearchTermValue = (state): string => {
  return state.library.searchFilter;
};

export const selectMonomersInCategory = (
  items: MonomerItemType[],
  category: LibraryNameType,
) => items.filter((item) => item.props?.MonomerType === category);

export const selectUnsplitNucleotides = (items: MonomerItemType[]) =>
  items.filter(
    (item) =>
      item.props?.MonomerClass === KetMonomerClass.RNA ||
      item.props?.MonomerClass === KetMonomerClass.DNA,
  );

export const selectMonomersInFavorites = (items: MonomerItemType[]) =>
  items.filter((item) => item.favorite);

export const selectFilteredMonomers = createSelector(
  (state) => state.library,
  (state): Array<MonomerItemType & { favorite: boolean }> => {
    const { searchFilter, monomers, favorites } = state;

    return monomers
      .filter((item: MonomerItemType) => {
        const { Name = '', MonomerName = '' } = item.props;
        const monomerName = Name.toLowerCase();
        const monomerNameFull = MonomerName.toLowerCase();
        const normalizedSearchFilter = searchFilter.toLowerCase();
        const cond =
          monomerName.includes(normalizedSearchFilter) ||
          monomerNameFull.includes(normalizedSearchFilter);
        return cond;
      })
      .map((item: MonomerItemType) => {
        return {
          ...item,
          favorite: !!favorites[getMonomerUniqueKey(item)],
        };
      });
  },
);

export const selectMonomers = (state: RootState) => {
  return state.library.monomers;
};

export const selectMonomerGroups = (monomers: MonomerItemType[]) => {
  const preparedData: Record<string, MonomerItemType[]> = monomers.reduce(
    (result, monomerItem) => {
      // separate monomers by NaturalAnalogCode
      const code =
        monomerItem.props.MonomerNaturalAnalogCode ||
        NoNaturalAnalogueGroupCode;
      if (!result[code]) {
        result[code] = [];
      }
      result[code].push({
        ...monomerItem,
        label: monomerItem.props.MonomerName,
      });
      return result;
    },
    {},
  );

  const sortedPreparedData = Object.entries(preparedData).reduce(
    (result, [code, monomers]) => {
      const sortedMonomers = monomers.sort((a, b) =>
        a.label.localeCompare(b.label),
      );
      const baseIndex = sortedMonomers.findIndex(
        (monomer) => monomer.label === code,
      );
      if (baseIndex !== -1) {
        const base = sortedMonomers.splice(baseIndex, 1);
        sortedMonomers.unshift(base[0]);
      }
      result[code] = sortedMonomers;
      return result;
    },
    {},
  );

  // generate list of monomer groups
  const preparedGroups: Group[] = [];
  return Object.keys(sortedPreparedData)
    .sort((a, b) => a.localeCompare(b))
    .reduce((result, code) => {
      const group: Group = {
        groupTitle:
          code === NoNaturalAnalogueGroupCode
            ? NoNaturalAnalogueGroupTitle
            : code,
        groupItems: [],
      };
      sortedPreparedData[code].forEach((item: MonomerItemType) => {
        group.groupItems.push({
          ...item,
          props: { ...item.props },
        });
      });
      if (group.groupItems.length) {
        result.push(group);
      }
      return result;
    }, preparedGroups);
};

export const selectCurrentTabIndex = (state) => state.library.selectedTabIndex;

export const {
  loadMonomerLibrary,
  setFavoriteMonomersFromLocalStorage,
  clearFavorites,
  toggleMonomerFavorites,
  setSearchFilter,
  setSelectedTabIndex,
} = librarySlice.actions;

export const libraryReducer = librarySlice.reducer;
