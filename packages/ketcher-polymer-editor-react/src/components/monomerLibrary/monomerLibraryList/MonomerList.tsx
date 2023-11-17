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

import { useEffect, useState } from 'react';
import { MonomerGroup } from '../monomerLibraryGroup';
import { useAppSelector } from 'hooks';
import { MonomerListContainer } from './styles';
import { IMonomerListProps } from './types';
import {
  selectFilteredMonomers,
  selectMonomerGroups,
  selectMonomersInCategory,
  selectMonomersInFavorites,
  getMonomerUniqueKey,
} from 'state/library';
import { MONOMER_LIBRARY_FAVORITES } from '../../../constants';
import { MonomerItemType } from 'ketcher-core';
import { selectEditorActiveTool } from 'state/common';
import {
  selectFilteredPresets,
  selectPresetsInFavorites,
} from 'state/rna-builder';
import { RnaPresetGroup } from '../RnaPresetGroup/RnaPresetGroup';
import { IRnaPreset } from '../RnaBuilder/types';

export type Group = {
  groupItems: Array<MonomerItemType>;
  groupTitle?: string;
};

export type Favorites = {
  monomers: MonomerItemType[];
  presets: IRnaPreset[];
};

const MonomerList = ({
  onItemClick,
  libraryName,
  duplicatePreset,
  editPreset,
}: IMonomerListProps) => {
  const monomers = useAppSelector(selectFilteredMonomers);
  const presets = useAppSelector(selectFilteredPresets);
  const activeTool = useAppSelector(selectEditorActiveTool);
  const isFavoriteTab = libraryName === MONOMER_LIBRARY_FAVORITES;
  const items = !isFavoriteTab
    ? selectMonomersInCategory(monomers, libraryName)
    : ({
        monomers: selectMonomersInFavorites(monomers),
        presets: selectPresetsInFavorites(presets),
      } as Favorites);

  const monomerGroups = selectMonomerGroups(
    isFavoriteTab
      ? (items as Favorites).monomers
      : (items as MonomerItemType[]),
  );

  const [selectedMonomers, setSelectedMonomers] = useState('');

  const selectMonomer = (monomer: MonomerItemType) => {
    setSelectedMonomers(getMonomerUniqueKey(monomer));
  };

  useEffect(() => {
    if (activeTool !== 'monomer') {
      setSelectedMonomers('');
    }
  }, [activeTool]);

  return (
    <MonomerListContainer>
      {monomerGroups.length > 0 && <div>Monomers</div>}
      {monomerGroups.map(({ groupItems, groupTitle }, _index, groups) => {
        return (
          <MonomerGroup
            key={groupTitle}
            title={groups.length === 1 ? undefined : groupTitle}
            items={groupItems}
            libraryName={libraryName}
            onItemClick={onItemClick || selectMonomer}
            selectedMonomerUniqueKey={selectedMonomers}
          />
        );
      })}
      {isFavoriteTab && (items as Favorites).presets.length > 0 && (
        <>
          <div>Presets</div>
          <RnaPresetGroup
            duplicatePreset={duplicatePreset}
            editPreset={editPreset}
            presets={(items as Favorites).presets}
          />
        </>
      )}
    </MonomerListContainer>
  );
};

export { MonomerList };
