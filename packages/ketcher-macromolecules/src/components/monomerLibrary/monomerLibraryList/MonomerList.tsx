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

import { Fragment, useEffect, useState } from 'react';
import { MonomerGroup } from '../monomerLibraryGroup';
import { useAppSelector } from 'hooks';
import {
  FavoritesSectionTitle,
  FavoritesSubsectionTitle,
  MonomerListContainer,
} from './styles';
import { Group, IMonomerListProps } from './types';
import { useFavoritesGroups } from './hooks/useFavoritesGroups';
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
import { selectFilteredPresets } from 'state/rna-builder';
import { RnaPresetGroup } from '../RnaPresetGroup/RnaPresetGroup';

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
  const favorites = useFavoritesGroups(monomers, presets);

  const [selectedMonomers, setSelectedMonomers] = useState('');

  useEffect(() => {
    if (activeTool !== 'monomer') {
      setSelectedMonomers('');
    }
  }, [activeTool]);

  const renderMonomerGroups = (groups: Group[]) =>
    groups.map(({ groupItems, groupTitle }) => (
      <MonomerGroup
        key={groupTitle}
        title={groupTitle}
        items={groupItems}
        libraryName={libraryName}
        onItemClick={onItemClick}
        selectedMonomerUniqueKey={selectedMonomers}
      />
    ));

  if (isFavoriteTab) {
    const { peptides, rna, chem } = favorites;

    return (
      <MonomerListContainer>
        {peptides.hasItems && (
          <>
            <FavoritesSectionTitle>Peptides</FavoritesSectionTitle>
            {renderMonomerGroups(peptides.groups)}
          </>
        )}
        {rna.hasItems && (
          <>
            <FavoritesSectionTitle>RNA</FavoritesSectionTitle>
            {rna.presets.length > 0 && (
              <>
                <FavoritesSubsectionTitle>Presets</FavoritesSubsectionTitle>
                <RnaPresetGroup
                  duplicatePreset={duplicatePreset}
                  editPreset={editPreset}
                  presets={rna.presets}
                />
              </>
            )}
            {rna.subsections.map(({ title, groups }) => (
              <Fragment key={title}>
                <FavoritesSubsectionTitle>{title}</FavoritesSubsectionTitle>
                {renderMonomerGroups(groups)}
              </Fragment>
            ))}
          </>
        )}
        {chem.hasItems && (
          <>
            <FavoritesSectionTitle>CHEM</FavoritesSectionTitle>
            {renderMonomerGroups(chem.groups)}
          </>
        )}
      </MonomerListContainer>
    );
  }

  const monomerGroups = selectMonomerGroups(
    selectMonomersInCategory(monomers, libraryName),
  );
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
      <>
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
      </>
    </MonomerListContainer>
  );
};

export { MonomerList };
