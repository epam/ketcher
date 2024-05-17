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
import React, { ChangeEvent, useRef } from 'react';
import { Tabs } from 'components/shared/Tabs';
import { tabsContent } from 'components/monomerLibrary/tabsContent';
import {
  useAppDispatch,
  useAppSelector,
  useLayoutMode,
  useSequenceEditInRNABuilderMode,
} from 'hooks';
import { setSearchFilter } from 'state/library';
import { Icon } from 'ketcher-react';
import { IRnaPreset } from './RnaBuilder/types';
import {
  selectAllPresets,
  setActivePreset,
  setIsEditMode,
  setUniqueNameError,
} from 'state/rna-builder';
import { scrollToSelectedPreset } from './RnaBuilder/RnaEditor/RnaEditor';
import {
  MonomerLibraryContainer,
  MonomerLibraryHeader,
  MonomerLibraryInput,
  MonomerLibrarySearch,
  MonomerLibraryTitle,
} from './styles';

const COPY = '_Copy';

const MonomerLibrary = React.memo(() => {
  const presetsRef = useRef<IRnaPreset[]>([]);
  const dispatch = useAppDispatch();
  const layoutMode = useLayoutMode();
  const isSequenceEditInRNABuilderMode = useSequenceEditInRNABuilderMode();
  const isSequenceMode = layoutMode === 'sequence-layout-mode';
  const isDisabledTabs = isSequenceMode;
  const isDisabledTabsPanels =
    isSequenceMode && !isSequenceEditInRNABuilderMode;

  useAppSelector(selectAllPresets, (presets) => {
    presetsRef.current = presets;
    return true;
  });
  const filterResults = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(event.target.value));
  };

  const duplicatePreset = (preset?: IRnaPreset) => {
    let name = `${preset?.name}${COPY}`;
    let presetWithSameName: IRnaPreset | undefined;

    do {
      presetWithSameName = presetsRef.current.find(
        (preset) => preset.name === name,
      );
      if (presetWithSameName) name += COPY;
    } while (presetWithSameName);

    if (presetWithSameName) {
      dispatch(setUniqueNameError(name));
      return;
    }

    const nameToSet = presetWithSameName ? `${name}_Copy` : name;
    const duplicatedPreset = {
      ...preset,
      name: nameToSet,
      nameInList: nameToSet,
      default: false,
      favorite: false,
    };
    dispatch(setActivePreset(duplicatedPreset));
    dispatch(setIsEditMode(true));
    scrollToSelectedPreset(preset?.name);
  };

  const editPreset = (preset: IRnaPreset) => {
    dispatch(setActivePreset(preset));
    dispatch(setIsEditMode(true));
  };

  return (
    <MonomerLibraryContainer data-testid="monomer-library">
      <MonomerLibraryHeader>
        <MonomerLibraryTitle>Library</MonomerLibraryTitle>
        <MonomerLibrarySearch>
          <div>
            <span>
              <Icon name="search" />
            </span>
            <MonomerLibraryInput
              type="search"
              data-testid="monomer-library-input"
              onChange={filterResults}
              placeholder="Search by name..."
            />
          </div>
        </MonomerLibrarySearch>
      </MonomerLibraryHeader>
      <Tabs
        disabledTabs={isDisabledTabs}
        disabledTabsPanels={isDisabledTabsPanels}
        tabs={tabsContent(duplicatePreset, editPreset)}
      />
    </MonomerLibraryContainer>
  );
});

export { MonomerLibrary };
