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

import { useMemo } from 'react';
import {
  IRnaPreset,
  KetMonomerClass,
  MonomerItemType,
  MonomerOrAmbiguousType,
} from 'ketcher-core';
import {
  selectAmbiguousMonomersInCategory,
  selectMonomerGroups,
  selectMonomersInCategory,
  selectMonomersInFavorites,
  selectUnsplitNucleotides,
} from 'state/library';
import { selectPresetsInFavorites } from 'state/rna-builder';
import { MONOMER_TYPES, MonomerGroups } from 'src/constants';
import { Group } from '../types';

const isMonomerItem = (item: MonomerOrAmbiguousType): item is MonomerItemType =>
  !item.isAmbiguous;

const filterGroupsByMonomerClass = (
  groups: Group[],
  monomerClass: KetMonomerClass,
): Group[] =>
  groups
    .map((group) => ({
      ...group,
      groupItems: group.groupItems.filter(
        (item) =>
          isMonomerItem(item) && item.props?.MonomerClass === monomerClass,
      ),
    }))
    .filter((group) => group.groupItems.length > 0);

const filterFavoriteGroupItems = (groups: Group[]): Group[] =>
  groups
    .map((group) => ({
      ...group,
      groupItems: group.groupItems.filter((item) => item.favorite),
    }))
    .filter((group) => group.groupItems.length > 0);

export type RnaSubsection = {
  title: MonomerGroups;
  groups: Group[];
};

export type FavoritesGroups = {
  peptides: {
    hasItems: boolean;
    groups: Group[];
  };
  rna: {
    hasItems: boolean;
    presets: IRnaPreset[];
    subsections: RnaSubsection[];
  };
  chem: {
    hasItems: boolean;
    groups: Group[];
  };
};

/**
 * Splits the flat list of favorite monomers/presets into the same
 * Peptides / RNA (Sugars, Bases, Phosphates, Nucleotides, Presets) / CHEM
 * sections used by the rest of the library, so that monomers sharing the
 * same natural analog code (e.g. Alanine and Adenine, both "A") are never
 * rendered next to each other without context.
 */
export const useFavoritesGroups = (
  monomers: MonomerOrAmbiguousType[],
  presets: IRnaPreset[],
): FavoritesGroups =>
  useMemo(() => {
    const favoriteMonomers = selectMonomersInFavorites(monomers);

    const peptideGroups = selectMonomerGroups(
      selectMonomersInCategory(favoriteMonomers, MONOMER_TYPES.PEPTIDE),
    );
    const peptideAmbiguousGroups = filterFavoriteGroupItems(
      selectAmbiguousMonomersInCategory(monomers, MonomerGroups.PEPTIDES),
    );

    const rnaGroupsByCode = selectMonomerGroups(
      selectMonomersInCategory(favoriteMonomers, MONOMER_TYPES.RNA),
    );
    const sugarGroups = filterGroupsByMonomerClass(
      rnaGroupsByCode,
      KetMonomerClass.Sugar,
    );
    const baseGroups = filterGroupsByMonomerClass(
      rnaGroupsByCode,
      KetMonomerClass.Base,
    );
    const baseAmbiguousGroups = filterFavoriteGroupItems(
      selectAmbiguousMonomersInCategory(monomers, MonomerGroups.BASES),
    );
    const phosphateGroups = filterGroupsByMonomerClass(
      rnaGroupsByCode,
      KetMonomerClass.Phosphate,
    );
    const nucleotideGroups = selectMonomerGroups(
      selectUnsplitNucleotides(favoriteMonomers),
    );
    const favoritePresets = selectPresetsInFavorites(presets);

    const chemGroups = selectMonomerGroups(
      selectMonomersInCategory(favoriteMonomers, MONOMER_TYPES.CHEM),
    );

    const rnaSubsections: RnaSubsection[] = [
      { title: MonomerGroups.SUGARS, groups: sugarGroups },
      {
        title: MonomerGroups.BASES,
        groups: [...baseGroups, ...baseAmbiguousGroups],
      },
      { title: MonomerGroups.PHOSPHATES, groups: phosphateGroups },
      { title: MonomerGroups.NUCLEOTIDES, groups: nucleotideGroups },
    ].filter((subsection) => subsection.groups.length > 0);

    return {
      peptides: {
        hasItems: peptideGroups.length > 0 || peptideAmbiguousGroups.length > 0,
        groups: [...peptideGroups, ...peptideAmbiguousGroups],
      },
      rna: {
        hasItems: favoritePresets.length > 0 || rnaSubsections.length > 0,
        presets: favoritePresets,
        subsections: rnaSubsections,
      },
      chem: {
        hasItems: chemGroups.length > 0,
        groups: chemGroups,
      },
    };
  }, [monomers, presets]);
