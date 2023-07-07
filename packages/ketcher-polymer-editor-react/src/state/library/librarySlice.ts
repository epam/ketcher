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
import { MonomerItemType } from 'components/monomerLibrary/monomerLibraryItem/types';
import { Group } from 'components/monomerLibrary/monomerLibraryList';
import { SdfItem } from 'ketcher-core';
import { LibraryNameType } from 'src/constants';

interface LibraryState {
  monomers: Group[];
  favorites: { [key: string]: Group };
  searchFilter: string;
}

const initialState: LibraryState = {
  monomers: [],
  favorites: {},
  searchFilter: '',
};

function getMonomerUniqueKey(monomer: MonomerItemType) {
  return `${monomer.props.MonomerName}___${monomer.props.Name}`;
}

export const librarySlice: Slice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    loadMonomerLibrary: (state, action: PayloadAction<SdfItem[]>) => {
      state.monomers = action.payload;
    },
    addMonomerFavorites: (state, action: PayloadAction<MonomerItemType>) => {
      state.favorites[getMonomerUniqueKey(action.payload)] = action.payload;
    },
    removeMonomerFavorites: (state, action: PayloadAction<MonomerItemType>) => {
      delete state.favorites[getMonomerUniqueKey(action.payload)];
    },
    toggleMonomerFavorites: (state, action: PayloadAction<MonomerItemType>) => {
      const key = getMonomerUniqueKey(action.payload);
      if (state.favorites[key]) {
        delete state.favorites[key];
      } else {
        state.favorites[key] = action.payload;
      }
    },
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.searchFilter = action.payload;
    },
  },
});

export const selectMonomersInCategory = (
  items: MonomerItemType[],
  category: LibraryNameType
) => items.filter((item) => item.props?.MonomerType === category);

export const selectMonomersInFavorites = (items: MonomerItemType[]) =>
  items.filter((item) => item.favorite);

export const selectFilteredMonomers = (state) => {
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

export const { loadMonomerLibrary, toggleMonomerFavorites, setSearchFilter } =
  librarySlice.actions;

export const libraryReducer = librarySlice.reducer;
