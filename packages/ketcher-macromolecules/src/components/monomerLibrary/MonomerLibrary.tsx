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

import { ChangeEvent, useCallback, useEffect, useMemo, useRef } from 'react';
import { Tabs } from 'components/shared/Tabs';
import { tabsContent } from 'components/monomerLibrary/tabsContent';
import { useAppDispatch, useAppSelector } from 'hooks';
import { setSearchFilter } from 'state/library';
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
  MonomerLibraryInputContainer,
  MonomerLibrarySearchIcon,
  MonomerLibraryToggle,
} from './styles';
import { Icon } from 'ketcher-react';

const COPY = '_Copy';

type Props = {
  toggleLibraryVisibility: VoidFunction;
};

const MonomerLibrary = ({ toggleLibraryVisibility }: Props) => {
  const presetsRef = useRef<IRnaPreset[]>([]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setSearchFilter(''));
  }, [dispatch]);

  useAppSelector(selectAllPresets, (presets) => {
    presetsRef.current = presets;
    return true;
  });

  const filterResults = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      dispatch(setSearchFilter(event.target.value));
    },
    [dispatch],
  );

  const duplicatePreset = useCallback(
    (preset?: IRnaPreset) => {
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

      const nameToSet = presetWithSameName ? `${name}${COPY}` : name;
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
    },
    [dispatch],
  );

  const editPreset = useCallback(
    (preset: IRnaPreset) => {
      dispatch(setActivePreset(preset));
      dispatch(setIsEditMode(true));
    },
    [dispatch],
  );

  const tabs = useMemo(
    () => tabsContent(duplicatePreset, editPreset),
    [duplicatePreset, editPreset],
  );

  return (
    <MonomerLibraryContainer data-testid="monomer-library">
      <MonomerLibraryHeader>
        <MonomerLibraryInputContainer>
          <MonomerLibrarySearchIcon name="search" />
          <MonomerLibraryInput
            type="search"
            data-testid="monomer-library-input"
            onChange={filterResults}
            placeholder="Search by name..."
          />
        </MonomerLibraryInputContainer>
        <MonomerLibraryToggle
          title="Hide library"
          onClick={toggleLibraryVisibility}
        >
          <Icon name="arrows-right" />
        </MonomerLibraryToggle>
      </MonomerLibraryHeader>
      <Tabs tabs={tabs} />
    </MonomerLibraryContainer>
  );
};

export { MonomerLibrary };
