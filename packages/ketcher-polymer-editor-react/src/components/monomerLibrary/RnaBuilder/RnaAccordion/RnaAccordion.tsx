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

import { MonomerGroup } from 'components/monomerLibrary/monomerLibraryGroup';
import { useAppSelector } from 'hooks';
import { IconName } from 'ketcher-react';
import { useEffect, useState, MouseEvent } from 'react';
import {
  MonomerCodeToGroup,
  MonomerGroupCodes,
  MonomerGroups,
} from 'src/constants';
import {
  getMonomerUniqueKey,
  selectFilteredMonomers,
  selectMonomerGroups,
  selectMonomersInCategory,
} from 'state/library';
import {
  DetailsContainer,
  DisabledArea,
  RnaAccordionContainer,
  StyledAccordion,
  StyledAccordionWrapper,
  StyledButton,
} from './styles';
import { Summary } from './Summary';
import {
  createNewPreset,
  RnaBuilderItem,
  RnaBuilderPresetsItem,
  selectActivePreset,
  selectActivePresetMonomerGroup,
  selectActiveRnaBuilderItem,
  selectIsActivePresetNewAndEmpty,
  selectIsEditMode,
  selectPresets,
  setActivePreset,
  setActivePresetForContextMenu,
  setActivePresetMonomerGroup,
  setActiveRnaBuilderItem,
  setIsEditMode,
} from 'state/rna-builder';
import { useDispatch } from 'react-redux';
import { RnaPresetItem } from 'components/monomerLibrary/RnaPresetItem';
import { IRnaPreset } from '../types';
import {
  GroupContainer,
  ItemsContainer,
} from 'components/monomerLibrary/monomerLibraryGroup/styles';
import { MonomerItemType } from 'ketcher-core';
import { selectEditor } from 'state/common';
import { RNAContextMenu } from 'components/contextMenu/RNAContextMenu';
import { CONTEXT_MENU_ID } from 'components/contextMenu/types';
import { useContextMenu } from 'react-contexify';

interface IGroupsDataItem {
  groupName: RnaBuilderItem;
  iconName: string;
  groups: {
    groupItems: IRnaPreset[] | MonomerItemType[];
    groupTitle?: string;
  }[];
}

export const RnaAccordion = ({ libraryName, duplicatePreset, editPreset }) => {
  const monomers = useAppSelector(selectFilteredMonomers);
  const items = selectMonomersInCategory(monomers, libraryName);
  const activeRnaBuilderItem = useAppSelector(selectActiveRnaBuilderItem);
  const activePreset = useAppSelector(selectActivePreset);
  const groups = selectMonomerGroups(items);
  const presets = useAppSelector(selectPresets);
  const isEditMode = useAppSelector(selectIsEditMode);
  const editor = useAppSelector(selectEditor);
  const isActivePresetNewAndEmpty = useAppSelector(
    selectIsActivePresetNewAndEmpty,
  );

  const [expandedAccordion, setExpandedAccordion] =
    useState<RnaBuilderItem | null>(activeRnaBuilderItem);

  const { show } = useContextMenu({ id: CONTEXT_MENU_ID.FOR_RNA });

  const handleAccordionSummaryClick = (rnaBuilderItem: RnaBuilderItem) => {
    if (expandedAccordion === rnaBuilderItem) {
      setExpandedAccordion(null);
    } else setExpandedAccordion(rnaBuilderItem);
  };

  const groupsData: IGroupsDataItem[] = [
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
          MonomerCodeToGroup[group.groupTitle as MonomerGroupCodes] ===
          MonomerGroups.SUGARS,
      ),
    },
    {
      groupName: MonomerGroups.BASES,
      iconName: 'base',
      groups: groups.filter(
        (group) =>
          MonomerCodeToGroup[group.groupTitle as MonomerGroupCodes] ===
          MonomerGroups.BASES,
      ),
    },
    {
      groupName: MonomerGroups.PHOSPHATES,
      iconName: 'phosphate',
      groups: groups.filter(
        (group) =>
          MonomerCodeToGroup[group.groupTitle as MonomerGroupCodes] ===
          MonomerGroups.PHOSPHATES,
      ),
    },
  ];
  const dispatch = useDispatch();
  const selectItem = (monomer, groupName) => {
    editor.events.selectMonomer.dispatch(monomer);
    if (!isEditMode) return;

    dispatch(setActivePresetMonomerGroup({ groupName, groupItem: monomer }));
    dispatch(setActiveRnaBuilderItem(groupName));
  };

  useEffect(() => {
    setExpandedAccordion(activeRnaBuilderItem);
  }, [activeRnaBuilderItem]);

  useEffect(() => {
    dispatch(
      setActiveRnaBuilderItem(
        isEditMode && activePreset
          ? activeRnaBuilderItem
          : RnaBuilderPresetsItem.Presets,
      ),
    );
  }, [isEditMode]);

  const selectPreset = (preset: IRnaPreset) => () => {
    dispatch(setActivePreset(preset));
    editor.events.selectPreset.dispatch(preset);
    if (preset === activePreset.presetInList) return;
    dispatch(setIsEditMode(false));
  };

  const onClickNewPreset = () => {
    dispatch(createNewPreset());
    dispatch(setActiveRnaBuilderItem(RnaBuilderPresetsItem.Presets));
    dispatch(setIsEditMode(true));
  };

  const getMenuPosition = (currentPresetCard: HTMLElement) => {
    const isDivCard = currentPresetCard instanceof HTMLDivElement;
    if (!isDivCard && currentPresetCard.parentElement) {
      currentPresetCard = currentPresetCard.parentElement;
    }
    const boundingBox = currentPresetCard.getBoundingClientRect();
    const parentBox = currentPresetCard.offsetParent?.getBoundingClientRect();
    const contextMenuWidth = 140;
    let x = boundingBox.right - contextMenuWidth;
    const y = boundingBox.y + boundingBox.height / 2;
    if (parentBox?.x && parentBox?.x > x) {
      x = boundingBox.x;
    }
    return {
      x,
      y,
    };
  };

  const handleContextMenu = (preset: IRnaPreset) => (event: MouseEvent) => {
    dispatch(setActivePresetForContextMenu(preset));
    show({
      event,
      props: {
        duplicatePreset,
        editPreset,
      },
      position: getMenuPosition(event.currentTarget as HTMLElement),
    });
  };

  return (
    <RnaAccordionContainer data-testid="rna-accordion">
      {groupsData.map((groupData) => {
        const expanded = expandedAccordion === groupData.groupName;
        const quantity = groupData.groups.reduce(
          (acc, group) => acc + group.groupItems.length || 0,
          0,
        );
        const summary = (
          <Summary
            iconName={groupData.iconName as IconName}
            groupName={groupData.groupName}
            quantity={quantity}
            expanded={expanded}
          />
        );
        const details =
          groupData.groupName === RnaBuilderPresetsItem.Presets ? (
            <DetailsContainer>
              <StyledButton onClick={() => onClickNewPreset()}>
                New Preset
              </StyledButton>
              <GroupContainer>
                <ItemsContainer>
                  {presets.map((preset, index) => {
                    return (
                      <RnaPresetItem
                        key={`${preset.name}${index}`}
                        preset={preset}
                        onClick={selectPreset(preset)}
                        onContextMenu={handleContextMenu(preset)}
                        isSelected={activePreset?.presetInList === preset}
                      />
                    );
                  })}
                </ItemsContainer>
                <RNAContextMenu />
              </GroupContainer>
              {isEditMode && !isActivePresetNewAndEmpty && <DisabledArea />}
            </DetailsContainer>
          ) : (
            <DetailsContainer>
              {groupData.groups.map(({ groupItems, groupTitle }) => {
                const monomer = selectActivePresetMonomerGroup(
                  activePreset,
                  groupData.groupName,
                );
                return (
                  <MonomerGroup
                    key={groupTitle}
                    title={groupData.groups.length > 1 ? groupTitle : undefined}
                    items={groupItems as MonomerItemType[]}
                    selectedMonomerUniqueKey={
                      monomer ? getMonomerUniqueKey(monomer) : undefined
                    }
                    onItemClick={(monomer) =>
                      selectItem(monomer, groupData.groupName)
                    }
                  />
                );
              })}
            </DetailsContainer>
          );
        const presetsExpanded =
          groupData.groupName === RnaBuilderPresetsItem.Presets && expanded;

        return presetsExpanded ? (
          <StyledAccordionWrapper key={groupData.groupName}>
            <StyledAccordion
              data-testid="styled-accordion"
              summary={summary}
              details={details}
              expanded={expanded}
              onSummaryClick={() =>
                handleAccordionSummaryClick(groupData.groupName)
              }
            />
          </StyledAccordionWrapper>
        ) : (
          <StyledAccordion
            key={groupData.groupName}
            data-testid="styled-accordion"
            summary={summary}
            details={details}
            expanded={expanded}
            onSummaryClick={() =>
              handleAccordionSummaryClick(groupData.groupName)
            }
          />
        );
      })}
    </RnaAccordionContainer>
  );
};
