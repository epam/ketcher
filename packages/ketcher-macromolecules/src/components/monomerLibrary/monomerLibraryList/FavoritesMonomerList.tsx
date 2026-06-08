import { MonomerGroup } from '../monomerLibraryGroup';
import { RnaPresetGroup } from '../RnaPresetGroup/RnaPresetGroup';
import { IRnaPreset } from '../RnaBuilder/types';
import { LibraryNameType, MonomerGroups } from '../../../constants';
import { CategoryTitle, MonomerListContainer, SubsectionTitle } from './styles';
import { Group } from './types';
import {
  FAVORITES_LIBRARY_NAME,
  FavoritesRnaSection,
  useFavoritesData,
} from './hooks/useFavoritesData';
import { GroupedAmbiguousMonomerLibraryItemType } from 'state/library';

interface FavoritesMonomerListProps {
  duplicatePreset: (preset?: IRnaPreset) => void;
  editPreset: (preset: IRnaPreset) => void;
  onItemClick?: (item) => void;
  selectedMonomerUniqueKey: string;
}

const shouldShowGroupTitle = (
  groupTitle: string | undefined,
  groups: Group[],
  groupName?: MonomerGroups,
) => {
  if (!groupTitle) {
    return undefined;
  }

  if (
    groupName &&
    [MonomerGroups.BASES, MonomerGroups.NUCLEOTIDES].includes(groupName)
  ) {
    return groupTitle;
  }

  return groups.length > 1 ? groupTitle : undefined;
};

const MonomerGroupsList = ({
  groups,
  groupName,
  libraryName,
  onItemClick,
  selectedMonomerUniqueKey,
}: {
  groups: Group[];
  groupName?: MonomerGroups;
  libraryName: LibraryNameType;
  onItemClick?: (item) => void;
  selectedMonomerUniqueKey: string;
}) => (
  <>
    {groups.map(({ groupItems, groupTitle }) => (
      <MonomerGroup
        key={`${groupName ?? ''}-${groupTitle}`}
        title={shouldShowGroupTitle(groupTitle, groups, groupName)}
        groupName={groupName}
        items={groupItems}
        libraryName={libraryName}
        onItemClick={onItemClick}
        selectedMonomerUniqueKey={selectedMonomerUniqueKey}
      />
    ))}
  </>
);

const AmbiguousMonomerGroupsList = ({
  ambiguousGroups,
  libraryName,
  onItemClick,
  selectedMonomerUniqueKey,
}: {
  ambiguousGroups: GroupedAmbiguousMonomerLibraryItemType[];
  libraryName: LibraryNameType;
  onItemClick?: (item) => void;
  selectedMonomerUniqueKey: string;
}) => (
  <>
    {ambiguousGroups.map(({ groupTitle, groupItems }) => (
      <MonomerGroup
        key={groupTitle}
        title={groupTitle}
        items={groupItems}
        libraryName={libraryName}
        onItemClick={onItemClick}
        selectedMonomerUniqueKey={selectedMonomerUniqueKey}
      />
    ))}
  </>
);

const RnaSection = ({
  section,
  onItemClick,
  selectedMonomerUniqueKey,
}: {
  section: FavoritesRnaSection;
  onItemClick?: (item) => void;
  selectedMonomerUniqueKey: string;
}) => (
  <>
    <SubsectionTitle>{section.title}</SubsectionTitle>
    <MonomerGroupsList
      groups={section.groups}
      groupName={section.title}
      libraryName={FAVORITES_LIBRARY_NAME}
      onItemClick={onItemClick}
      selectedMonomerUniqueKey={selectedMonomerUniqueKey}
    />
    <AmbiguousMonomerGroupsList
      ambiguousGroups={section.ambiguousGroups}
      libraryName={FAVORITES_LIBRARY_NAME}
      onItemClick={onItemClick}
      selectedMonomerUniqueKey={selectedMonomerUniqueKey}
    />
  </>
);

const FavoritesMonomerList = ({
  duplicatePreset,
  editPreset,
  onItemClick,
  selectedMonomerUniqueKey,
}: FavoritesMonomerListProps) => {
  const favoritesData = useFavoritesData();

  return (
    <MonomerListContainer>
      {favoritesData.peptides.hasContent && (
        <>
          <CategoryTitle>Peptides</CategoryTitle>
          <MonomerGroupsList
            groups={favoritesData.peptides.groups}
            libraryName={FAVORITES_LIBRARY_NAME}
            onItemClick={onItemClick}
            selectedMonomerUniqueKey={selectedMonomerUniqueKey}
          />
          <AmbiguousMonomerGroupsList
            ambiguousGroups={favoritesData.peptides.ambiguousGroups}
            libraryName={FAVORITES_LIBRARY_NAME}
            onItemClick={onItemClick}
            selectedMonomerUniqueKey={selectedMonomerUniqueKey}
          />
        </>
      )}

      {favoritesData.rna.hasContent && (
        <>
          <CategoryTitle>RNA</CategoryTitle>
          {favoritesData.rna.presets.length > 0 && (
            <>
              <SubsectionTitle>Presets</SubsectionTitle>
              <RnaPresetGroup
                duplicatePreset={duplicatePreset}
                editPreset={editPreset}
                presets={favoritesData.rna.presets}
              />
            </>
          )}
          {favoritesData.rna.sections.map((section) => (
            <RnaSection
              key={section.title}
              section={section}
              onItemClick={onItemClick}
              selectedMonomerUniqueKey={selectedMonomerUniqueKey}
            />
          ))}
        </>
      )}

      {favoritesData.chem.hasContent && (
        <>
          <CategoryTitle>CHEM</CategoryTitle>
          <MonomerGroupsList
            groups={favoritesData.chem.groups}
            libraryName={FAVORITES_LIBRARY_NAME}
            onItemClick={onItemClick}
            selectedMonomerUniqueKey={selectedMonomerUniqueKey}
          />
        </>
      )}
    </MonomerListContainer>
  );
};

export { FavoritesMonomerList };
