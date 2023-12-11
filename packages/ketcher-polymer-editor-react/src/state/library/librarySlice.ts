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
import { Group } from 'components/monomerLibrary/monomerLibraryList/types';

import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';
import { MonomerItemType, SdfItem } from 'ketcher-core';
import { LibraryNameType, FAVORITE_ITEMS_UNIQUE_KEYS } from 'src/constants';
import { RootState } from 'state';
import { localStorageCopy } from 'helpers/localStorage';

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
      const newData = action.payload.map((monomer) => {
        let monomerLeavingGroups: { [key: string]: string };
        if (typeof monomer.props.MonomerCaps === 'string') {
          const monomerLeavingGroupsArray =
            monomer.props.MonomerCaps?.split(',');

          monomerLeavingGroups = monomerLeavingGroupsArray?.reduce(
            (acc, item) => {
              const [attachmentPoint, leavingGroup] = item.slice(1).split(']');
              acc[attachmentPoint] = leavingGroup;
              return acc;
            },
            {},
          );
          return {
            ...monomer,
            props: { ...monomer.props, MonomerCaps: monomerLeavingGroups },
          };
        }
        return monomer;
      });
      state.monomers = newData;
    },

    setFavoriteMonomersFromLocalStorage: (state: RootState) => {
      const localFavorites = {};

      const favoritesInLocalStorage: null | string = localStorageCopy.getItem(
        FAVORITE_ITEMS_UNIQUE_KEYS,
      );

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

    unsetFavoriteMonomersFromLocalStorage: (state: RootState) => {
      state.favorites = {};
    },

    toggleMonomerFavorites: (
      state: RootState,
      action: PayloadAction<MonomerItemType>,
    ) => {
      const key: string = getMonomerUniqueKey(action.payload);

      const favoriteItemsUniqueKeys = (localStorageCopy.getItem(
        FAVORITE_ITEMS_UNIQUE_KEYS,
      ) || []) as string[];

      if (state.favorites[key]) {
        delete state.favorites[key];
        localStorageCopy.setItem(
          FAVORITE_ITEMS_UNIQUE_KEYS,
          favoriteItemsUniqueKeys.filter((targetKey) => targetKey !== key),
        );
      } else {
        state.favorites[key] = { ...action.payload, favorite: true };
        favoriteItemsUniqueKeys.push(key);
        localStorageCopy.setItem(
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

export const selectMonomersInFavorites = (items: MonomerItemType[]) =>
  items.filter((item) => item.favorite);

export const selectFilteredMonomers = (
  state,
): Array<MonomerItemType & { favorite: boolean }> => {
  const { searchFilter, monomers } = state.library;
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
        favorite: !!state.library.favorites[getMonomerUniqueKey(item)],
      };
    });
};

export const selectMonomers = (state: RootState) => {
  return state.library.monomers;
};

export const selectMonomerGroups = (monomers: MonomerItemType[]) => {
  const preparedData = monomers.reduce((result, monomerItem) => {
    // separate monomers by NaturalAnalogCode
    const code = monomerItem.props.MonomerNaturalAnalogCode;
    if (!result[code]) {
      result[code] = [];
    }
    result[code].push({
      ...monomerItem,
      label: monomerItem.props.MonomerName,
    });
    return result;
  }, {});
  // generate list of monomer groups
  const preparedGroups: Group[] = [];
  return Object.keys(preparedData)
    .sort()
    .reduce((result, code) => {
      const group: Group = {
        groupTitle: code,
        groupItems: [],
      };
      preparedData[code].forEach((item: MonomerItemType) => {
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
  unsetFavoriteMonomersFromLocalStorage,
  toggleMonomerFavorites,
  setSearchFilter,
  setSelectedTabIndex,
} = librarySlice.actions;

export const libraryReducer = librarySlice.reducer;
