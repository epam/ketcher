import { useMemo } from 'react';
import {
  LibraryNameType,
  MonomerCodeToGroup,
  MonomerGroups,
} from 'src/constants';
import {
  RnaBuilderPresetsItem,
  selectFilteredPresets,
} from 'state/rna-builder';
import { KetMonomerClass } from 'ketcher-core';
import {
  selectFilteredMonomers,
  selectMonomerGroups,
  selectMonomersInCategory,
  selectUnsplitNucleotides,
} from 'state/library';
import { useAppSelector } from 'hooks';

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
        groups: groups.filter(
          (group) =>
            MonomerCodeToGroup[group.groupTitle as string] ===
            MonomerGroups.SUGARS,
        ),
      },
      {
        groupName: MonomerGroups.BASES,
        iconName: 'base',
        groups: groups
          .filter(
            (group) =>
              MonomerCodeToGroup[group.groupTitle as string] ===
              MonomerGroups.BASES,
          )
          .map((group) => ({
            ...group,
            groupItems: group.groupItems.filter(
              (item) => item.props?.MonomerClass !== KetMonomerClass.RNA,
            ),
          })),
      },
      {
        groupName: MonomerGroups.PHOSPHATES,
        iconName: 'phosphate',
        groups: groups.filter(
          (group) =>
            MonomerCodeToGroup[group.groupTitle as string] ===
            MonomerGroups.PHOSPHATES,
        ),
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
