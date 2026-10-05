import { useMemo } from 'react';
import { LibraryNameType, MonomerGroups } from 'src/constants';
import {
  RnaBuilderPresetsItem,
  selectFilteredPresets,
} from 'state/rna-builder';
import {
  KetMonomerClass,
  MonomerItemType,
  MonomerOrAmbiguousType,
} from 'ketcher-core';
import {
  selectFilteredMonomers,
  selectMonomerGroups,
  selectMonomersInCategory,
  selectUnsplitNucleotides,
} from 'state/library';
import { useAppSelector } from 'hooks';

const isMonomerItem = (item: MonomerOrAmbiguousType): item is MonomerItemType =>
  !item.isAmbiguous;

export const useGroupsData = (libraryName: LibraryNameType) => {
  const monomers = useAppSelector(selectFilteredMonomers);
  const presets = useAppSelector(selectFilteredPresets);
  const items = selectMonomersInCategory(monomers, libraryName);
  const groups = selectMonomerGroups(items);
  const nucleotideItems = selectUnsplitNucleotides(monomers);
  const nucleotideGroups = selectMonomerGroups(nucleotideItems);

  return useMemo(
    () => [
      {
        groupName: RnaBuilderPresetsItem.Presets,
        iconName: 'preset',
        groups: [{ groupItems: presets }],
      },
      {
        groupName: MonomerGroups.SUGARS,
        iconName: 'sugar',
        groups: groups
          .map((group) => ({
            ...group,
            groupItems: group.groupItems.filter(
              (item) =>
                isMonomerItem(item) &&
                item.props?.MonomerClass === KetMonomerClass.Sugar,
            ),
          }))
          .filter((group) => group.groupItems.length),
      },
      {
        groupName: MonomerGroups.BASES,
        iconName: 'base',
        groups: groups
          .map((group) => ({
            ...group,
            groupItems: group.groupItems.filter(
              (item) =>
                isMonomerItem(item) &&
                item.props?.MonomerClass === KetMonomerClass.Base,
            ),
          }))
          .filter((group) => group.groupItems.length),
      },
      {
        groupName: MonomerGroups.PHOSPHATES,
        iconName: 'phosphate',
        groups: groups
          .map((group) => ({
            ...group,
            groupItems: group.groupItems.filter(
              (item) =>
                isMonomerItem(item) &&
                item.props?.MonomerClass === KetMonomerClass.Phosphate,
            ),
          }))
          .filter((group) => group.groupItems.length),
      },
      {
        groupName: MonomerGroups.NUCLEOTIDES,
        iconName: 'nucleotide',
        groups: nucleotideGroups,
      },
    ],
    [groups, presets, nucleotideGroups],
  );
};

export type GroupsData = ReturnType<typeof useGroupsData>;
