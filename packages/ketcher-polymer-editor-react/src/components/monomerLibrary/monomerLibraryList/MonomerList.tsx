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

import { useState } from 'react';
import { MonomerGroup } from '../monomerLibraryGroup';
import { useAppSelector } from 'hooks';
import { MonomerListContainer } from './styles';
import { IMonomerListProps } from './types';
import {
  selectFilteredMonomers,
  selectMonomerGroups,
  selectMonomersInCategory,
  selectMonomersInFavorites,
} from 'state/library';
import { MONOMER_LIBRARY_FAVORITES } from '../../../constants';
import { MonomerItemType } from '../monomerLibraryItem/types';

export type Group = {
  groupItems: Array<MonomerItemType>;
  groupTitle?: string;
};

const MonomerList = ({ onItemClick, libraryName }: IMonomerListProps) => {
  const monomers = useAppSelector(selectFilteredMonomers);
  const items =
    libraryName !== MONOMER_LIBRARY_FAVORITES
      ? selectMonomersInCategory(monomers, libraryName)
      : selectMonomersInFavorites(monomers);

  const groups = selectMonomerGroups(items);

  const [selectedMonomers, setSelectedMonomers] = useState('');

  const selectItem = (monomer: MonomerItemType) => {
    setSelectedMonomers(monomer.label);
  };

  return (
    <MonomerListContainer>
      {groups.map(({ groupItems, groupTitle }, _index, groups) => {
        return (
          <MonomerGroup
            key={groupTitle}
            title={groups.length === 1 ? undefined : groupTitle}
            items={groupItems}
            onItemClick={onItemClick || selectItem}
            selectedMonomerLabel={selectedMonomers}
          />
        );
      })}
    </MonomerListContainer>
  );
};

export { MonomerList };
