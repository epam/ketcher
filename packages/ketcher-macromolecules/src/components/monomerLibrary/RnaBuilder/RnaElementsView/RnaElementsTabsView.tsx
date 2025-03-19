import { memo } from 'react';
import {
  CompactDetailsContainer,
  DetailsContainer,
  DisabledArea,
  RnaTab,
  RnaTabsContainer,
  RnaTabWrapper,
  StyledButton,
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
          const selected = groupData.groupName === activeRnaBuilderItem;
          const variantMonomers = selectAmbiguousMonomersInCategory(
            monomers,
            groupData.groupName as MonomerGroups,
          );
          const quantity = [...groupData.groups, ...variantMonomers].reduce(
            (acc, group) => acc + (group.groupItems.length || 0),
            0,
          );
          const caption = selected
            ? `${groupData.groupName} (${quantity})`
            : null;

          return (
            <RnaTabWrapper
              key={groupData.groupName}
              className={clsx(selected && 'rna-tab--selected')}
            >
              <RnaTab
                label={caption}
                title={groupData.groupName}
                selected={selected}
                icon={<Icon name={groupData.iconName as IconName} />}
                onClick={() =>
                  dispatch(setActiveRnaBuilderItem(groupData.groupName))
                }
              />
            </RnaTabWrapper>
          );
        })}
      </RnaTabsContainer>
      {groupsData.map((groupData) => {
        if (groupData.groupName !== activeRnaBuilderItem) {
          return null;
        }

        const variantMonomers = selectAmbiguousMonomersInCategory(
          monomers,
          groupData.groupName as MonomerGroups,
        );
        const details =
          groupData.groupName === RnaBuilderPresetsItem.Presets ? (
            <DetailsContainer>
              <StyledButton onClick={onNewPresetClick}>New Preset</StyledButton>
              <RnaPresetGroup
                duplicatePreset={duplicatePreset}
                editPreset={editPreset}
                presets={presets}
              />
              {isEditMode && !isActivePresetNewAndEmpty && <DisabledArea />}
            </DetailsContainer>
          ) : (
            <DetailsContainer>
              <>
                {groupData.groups.map(({ groupItems, groupTitle }) => (
                  <MonomerGroup
                    key={groupTitle}
                    title={groupData.groups.length > 1 ? groupTitle : undefined}
                    groupName={groupData.groupName}
                    items={groupItems}
                    selectedMonomerUniqueKey={activeMonomerKey}
                    onItemClick={(monomer) =>
                      onSelectItem(monomer, groupData.groupName)
                    }
                  />
                ))}
                {variantMonomers.map((group) => (
                  <MonomerGroup
                    key={group.groupTitle}
                    title={group.groupTitle}
                    items={group.groupItems}
                    libraryName={libraryName}
                    selectedMonomerUniqueKey={activeMonomerKey}
                    onItemClick={(monomer) =>
                      onSelectItem(monomer, groupData.groupName)
                    }
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
          <CompactDetailsContainer
            className={clsx(
              firstTabSelected && 'first-tab',
              lastTabSelected && 'last-tab',
            )}
            key={groupData.groupName}
          >
            {details}
          </CompactDetailsContainer>
        );
      })}
    </>
  );
};

export default memo(RnaElementsTabsView);
