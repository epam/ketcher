import { useMemo } from 'react';
import { KetMonomerClass } from 'ketcher-core';
import {
  MONOMER_LIBRARY_FAVORITES,
  MONOMER_TYPES,
  MonomerGroups,
} from 'src/constants';
import {
  selectFavoriteAmbiguousMonomersInCategory,
  selectFilteredMonomers,
  selectMonomerGroups,
  selectMonomersInCategory,
  selectMonomersInFavorites,
  selectUnsplitNucleotides,
} from 'state/library';
import { selectFilteredPresets, selectPresetsInFavorites } from 'state/rna-builder';
import { useAppSelector } from 'hooks';
import { Group } from '../types';
import { IRnaPreset } from '../../RnaBuilder/types';

const filterGroupsByMonomerClass = (
  groups: Group[],
  monomerClass: KetMonomerClass,
) =>
  groups
    .map((group) => ({
      ...group,
      groupItems: group.groupItems.filter(
        (item) => item.props?.MonomerClass === monomerClass,
      ),
    }))
    .filter((group) => group.groupItems.length);

export type FavoritesRnaSection = {
  title: MonomerGroups;
  groups: Group[];
  ambiguousGroups: ReturnType<typeof selectFavoriteAmbiguousMonomersInCategory>;
};

export type FavoritesData = {
  peptides: {
    groups: Group[];
    ambiguousGroups: ReturnType<typeof selectFavoriteAmbiguousMonomersInCategory>;
    hasContent: boolean;
  };
  rna: {
    presets: IRnaPreset[];
    sections: FavoritesRnaSection[];
    hasContent: boolean;
  };
  chem: {
    groups: Group[];
    hasContent: boolean;
  };
};

export const useFavoritesData = (): FavoritesData => {
  const monomers = useAppSelector(selectFilteredMonomers);
  const presets = useAppSelector(selectFilteredPresets);
  const favoriteMonomers = selectMonomersInFavorites(monomers);
  const favoritePresets = selectPresetsInFavorites(presets);

  return useMemo(() => {
    const peptideMonomers = selectMonomersInCategory(
      favoriteMonomers,
      MONOMER_TYPES.PEPTIDE,
    );
    const peptideGroups = selectMonomerGroups(peptideMonomers);
    const peptideAmbiguousGroups = selectFavoriteAmbiguousMonomersInCategory(
      monomers,
      MonomerGroups.PEPTIDES,
    );

    const chemMonomers = selectMonomersInCategory(
      favoriteMonomers,
      MONOMER_TYPES.CHEM,
    );
    const chemGroups = selectMonomerGroups(chemMonomers);

    const rnaMonomers = selectMonomersInCategory(
      favoriteMonomers,
      MONOMER_TYPES.RNA,
    );
    const rnaGroups = selectMonomerGroups(rnaMonomers);
    const nucleotideGroups = selectMonomerGroups(
      selectUnsplitNucleotides(favoriteMonomers),
    );
    const ambiguousBaseGroups = selectFavoriteAmbiguousMonomersInCategory(
      monomers,
      MonomerGroups.BASES,
    );

    const rnaSections: FavoritesRnaSection[] = [
      {
        title: MonomerGroups.SUGARS,
        groups: filterGroupsByMonomerClass(rnaGroups, KetMonomerClass.Sugar),
        ambiguousGroups: [],
      },
      {
        title: MonomerGroups.BASES,
        groups: filterGroupsByMonomerClass(rnaGroups, KetMonomerClass.Base),
        ambiguousGroups: ambiguousBaseGroups,
      },
      {
        title: MonomerGroups.PHOSPHATES,
        groups: filterGroupsByMonomerClass(
          rnaGroups,
          KetMonomerClass.Phosphate,
        ),
        ambiguousGroups: [],
      },
      {
        title: MonomerGroups.NUCLEOTIDES,
        groups: nucleotideGroups,
        ambiguousGroups: [],
      },
    ].filter(
      (section) =>
        section.groups.length > 0 || section.ambiguousGroups.length > 0,
    );

    const peptidesHasContent =
      peptideGroups.length > 0 || peptideAmbiguousGroups.length > 0;
    const rnaHasContent =
      favoritePresets.length > 0 || rnaSections.length > 0;
    const chemHasContent = chemGroups.length > 0;

    return {
      peptides: {
        groups: peptideGroups,
        ambiguousGroups: peptideAmbiguousGroups,
        hasContent: peptidesHasContent,
      },
      rna: {
        presets: favoritePresets,
        sections: rnaSections,
        hasContent: rnaHasContent,
      },
      chem: {
        groups: chemGroups,
        hasContent: chemHasContent,
      },
    };
  }, [favoriteMonomers, favoritePresets, monomers]);
};

export const FAVORITES_LIBRARY_NAME = MONOMER_LIBRARY_FAVORITES;
