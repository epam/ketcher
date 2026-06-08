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
  selectAmbiguousMonomersInCategory,
} from 'state/library';
import {
  MONOMER_LIBRARY_FAVORITES,
  MONOMER_LIBRARY_PEPTIDES,
  MonomerGroups,
} from '../../../constants';
import { selectEditorActiveTool } from 'state/common';
import { FavoritesMonomerList } from './FavoritesMonomerList';

const MonomerList = ({
  onItemClick,
  libraryName,
  duplicatePreset,
  editPreset,
}: IMonomerListProps) => {
  const monomers = useAppSelector(selectFilteredMonomers);
  const activeTool = useAppSelector(selectEditorActiveTool);
  const isFavoriteTab = libraryName === MONOMER_LIBRARY_FAVORITES;
  const [selectedMonomers, setSelectedMonomers] = useState('');

  useEffect(() => {
    if (activeTool !== 'monomer') {
      setSelectedMonomers('');
    }
  }, [activeTool]);

  if (isFavoriteTab) {
    return (
      <FavoritesMonomerList
        duplicatePreset={duplicatePreset}
        editPreset={editPreset}
        onItemClick={onItemClick}
        selectedMonomerUniqueKey={selectedMonomers}
      />
    );
  }

  const items = selectMonomersInCategory(monomers, libraryName);
  const monomerGroups = selectMonomerGroups(items);
  const ambiguousMonomers = selectAmbiguousMonomersInCategory(
    monomers,
    MonomerGroups.PEPTIDES,
  );

  return (
    <MonomerListContainer>
      {monomerGroups.map(({ groupItems, groupTitle }, _index, groups) => {
        return (
          <MonomerGroup
            key={groupTitle}
            title={groups.length === 1 ? undefined : groupTitle}
            items={groupItems}
            libraryName={libraryName}
            onItemClick={onItemClick}
            selectedMonomerUniqueKey={selectedMonomers}
          />
        );
      })}
      {libraryName === MONOMER_LIBRARY_PEPTIDES &&
        ambiguousMonomers.map((group) => {
          return (
            <MonomerGroup
              key={group.groupTitle}
              title={group.groupTitle}
              items={group.groupItems}
              libraryName={libraryName}
              onItemClick={onItemClick}
              selectedMonomerUniqueKey={selectedMonomers}
            />
          );
        })}
    </MonomerListContainer>
  );
};

export type { Group } from './types';
export { MonomerList };
