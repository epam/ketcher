/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { MonomerGroup } from '../monomerLibraryGroup';
import { useAppSelector } from 'hooks';
import { resolveLocalizedTitle } from 'helpers/resolveLocalizedTitle';
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
import { selectFilteredPresets } from 'state/rna-builder';
import { RnaPresetGroup } from '../RnaPresetGroup/RnaPresetGroup';

const MonomerList = ({
  onItemClick,
  libraryName,
  duplicatePreset,
  editPreset,
}: IMonomerListProps) => {
  const { t } = useTranslation(['macromoleculesDialogs', 'macromolecules']);
  const monomers = useAppSelector(selectFilteredMonomers);
  const presets = useAppSelector(selectFilteredPresets);
  const isFavoriteTab = libraryName === MONOMER_LIBRARY_FAVORITES;
  const favorites = useFavoritesGroups(monomers, presets);

  const renderMonomerGroups = (groups: Group[]) =>
    groups.map(({ groupItems, groupTitle }) => {
      const resolvedTitle = resolveLocalizedTitle(groupTitle, t);
      return (
        <MonomerGroup
          key={groupTitle}
          title={resolvedTitle}
          items={groupItems}
          libraryName={libraryName}
          onItemClick={onItemClick}
          selectedMonomerUniqueKey=""
        />
      );
    });

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
        const resolvedTitle = resolveLocalizedTitle(groupTitle, t);
        return (
          <MonomerGroup
            key={groupTitle}
            title={groups.length === 1 ? undefined : resolvedTitle}
            items={groupItems}
            libraryName={libraryName}
            onItemClick={onItemClick}
            selectedMonomerUniqueKey=""
          />
        );
      })}
      <>
        {libraryName === MONOMER_LIBRARY_PEPTIDES &&
          ambiguousMonomers.map((group) => {
            const resolvedTitle = resolveLocalizedTitle(group.groupTitle, t);
            return (
              <MonomerGroup
                key={group.groupTitle}
                title={resolvedTitle}
                items={group.groupItems}
                libraryName={libraryName}
                onItemClick={onItemClick}
                selectedMonomerUniqueKey=""
              />
            );
          })}
      </>
    </MonomerListContainer>
  );
};

export { MonomerList };
