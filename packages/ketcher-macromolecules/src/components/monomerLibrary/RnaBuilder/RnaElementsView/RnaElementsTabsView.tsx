import { memo } from 'react';
import {
  RnaTabContent,
  DetailsContainer,
  DisabledArea,
  RnaTab,
  RnaTabsContainer,
  RnaTabWrapper,
  StyledButton,
  CompactDetailsContainer,
} from 'components/monomerLibrary/RnaBuilder/RnaElementsView/styles';
import {
  selectAmbiguousMonomersInCategory,
  selectFilteredMonomers,
} from 'state/library';
import { MonomerGroups } from '../../../../constants';
import clsx from 'clsx';
import { Icon, IconName } from 'ketcher-react';
import {
  RnaBuilderPresetsItem,
  selectActiveMonomerKey,
  selectFilteredPresets,
  selectIsActivePresetNewAndEmpty,
  selectIsEditMode,
  setActiveRnaBuilderItem,
} from 'state/rna-builder';
import { RnaPresetGroup } from 'components/monomerLibrary/RnaPresetGroup/RnaPresetGroup';
import { MonomerGroup } from 'components/monomerLibrary/monomerLibraryGroup';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'hooks';
import { RnaElementsViewProps } from 'components/monomerLibrary/RnaBuilder/RnaElementsView/types';

const RnaElementsTabsView = ({
  activeRnaBuilderItem,
  groupsData,
  onNewPresetClick,
  onSelectItem,
  duplicatePreset,
  editPreset,
  libraryName,
}: RnaElementsViewProps) => {
  const dispatch = useDispatch();
  const presets = useAppSelector(selectFilteredPresets);
  const monomers = useAppSelector(selectFilteredMonomers);
  const isEditMode = useAppSelector(selectIsEditMode);
  const isActivePresetNewAndEmpty = useAppSelector(
    selectIsActivePresetNewAndEmpty,
  );
  const activeMonomerKey = useAppSelector(selectActiveMonomerKey);

  return (
    <>
      <RnaTabsContainer>
        {groupsData.map((groupData) => {
          const { groupName, groups, iconName } = groupData;
          const selected = groupName === activeRnaBuilderItem;
          const variantMonomers = selectAmbiguousMonomersInCategory(
            monomers,
            groupName as MonomerGroups,
          );
          const quantity = [...groups, ...variantMonomers].reduce(
            (acc, group) => acc + (group.groupItems.length || 0),
            0,
          );
          const caption = selected ? `${groupName} (${quantity})` : null;

          return (
            <RnaTabWrapper
              key={groupName}
              className={clsx(selected && 'rna-tab--selected')}
            >
              <RnaTab
                label={caption}
                title={groupName}
                selected={selected}
                icon={<Icon name={iconName as IconName} />}
                onClick={() => dispatch(setActiveRnaBuilderItem(groupName))}
                data-testid={`summary-${groupName}`}
              />
            </RnaTabWrapper>
          );
        })}
      </RnaTabsContainer>
      {groupsData.map((groupData) => {
        const { groupName, groups } = groupData;
        if (groupName !== activeRnaBuilderItem) {
          return null;
        }

        const variantMonomers = selectAmbiguousMonomersInCategory(
          monomers,
          groupName as MonomerGroups,
        );
        const details =
          groupName === RnaBuilderPresetsItem.Presets ? (
            <DetailsContainer compact>
              <StyledButton onClick={onNewPresetClick}>New Preset</StyledButton>
              <RnaPresetGroup
                duplicatePreset={duplicatePreset}
                editPreset={editPreset}
                presets={presets}
              />
              {isEditMode && !isActivePresetNewAndEmpty && <DisabledArea />}
            </DetailsContainer>
          ) : (
            <DetailsContainer compact>
              <>
                {groups.map(({ groupItems, groupTitle }) => (
                  <MonomerGroup
                    key={groupTitle}
                    title={groups.length > 1 ? groupTitle : undefined}
                    groupName={groupName}
                    items={groupItems}
                    selectedMonomerUniqueKey={activeMonomerKey}
                    onItemClick={(monomer) => onSelectItem(monomer, groupName)}
                  />
                ))}
                {variantMonomers.map(({ groupTitle, groupItems }) => (
                  <MonomerGroup
                    key={groupTitle}
                    title={groupTitle}
                    items={groupItems}
                    libraryName={libraryName}
                    selectedMonomerUniqueKey={activeMonomerKey}
                    onItemClick={(monomer) => onSelectItem(monomer, groupName)}
                  />
                ))}
              </>
            </DetailsContainer>
          );

        const firstTabSelected =
          activeRnaBuilderItem === RnaBuilderPresetsItem.Presets;
        const lastTabSelected =
          activeRnaBuilderItem === MonomerGroups.NUCLEOTIDES;

        return (
          <RnaTabContent
            className={clsx(
              firstTabSelected && 'first-tab',
              lastTabSelected && 'last-tab',
            )}
            key={groupName}
          >
            <CompactDetailsContainer>{details}</CompactDetailsContainer>
          </RnaTabContent>
        );
      })}
    </>
  );
};

export default memo(RnaElementsTabsView);
