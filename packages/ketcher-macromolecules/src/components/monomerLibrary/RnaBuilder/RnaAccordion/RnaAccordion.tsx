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
import { useEffect, useState } from 'react';
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
  selectActiveRnaBuilderItem,
  selectCurrentMonomerGroup,
  selectFilteredPresets,
  selectIsActivePresetNewAndEmpty,
  selectIsEditMode,
  setActivePresetMonomerGroup,
  setActiveRnaBuilderItem,
  setIsEditMode,
} from 'state/rna-builder';
import { useDispatch } from 'react-redux';
import { IRnaPreset } from '../types';
import { MonomerItemType } from 'ketcher-core';
import {
  selectEditor,
  selectIsSequenceEditInRNABuilderMode,
} from 'state/common';
import { RnaPresetGroup } from 'components/monomerLibrary/RnaPresetGroup/RnaPresetGroup';

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
  const presets = useAppSelector(selectFilteredPresets);
  const isEditMode = useAppSelector(selectIsEditMode);
  const editor = useAppSelector(selectEditor);
  const isActivePresetNewAndEmpty = useAppSelector(
    selectIsActivePresetNewAndEmpty,
  );
  const isSequenceEditInRNABuilderMode = useAppSelector(
    selectIsSequenceEditInRNABuilderMode,
  );

  const [expandedAccordion, setExpandedAccordion] =
    useState<RnaBuilderItem | null>(activeRnaBuilderItem);

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
    if (!isSequenceEditInRNABuilderMode) {
      editor.events.selectMonomer.dispatch(monomer);
    }
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

  const onClickNewPreset = () => {
    dispatch(createNewPreset());
    dispatch(setActiveRnaBuilderItem(RnaBuilderPresetsItem.Presets));
    dispatch(setIsEditMode(true));
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
              <RnaPresetGroup
                duplicatePreset={duplicatePreset}
                editPreset={editPreset}
                presets={presets}
              />
              {isEditMode && !isActivePresetNewAndEmpty && <DisabledArea />}
            </DetailsContainer>
          ) : (
            <DetailsContainer>
              {groupData.groups.map(({ groupItems, groupTitle }) => {
                const monomer = selectCurrentMonomerGroup(
                  activePreset,
                  groupData.groupName,
                );
                return (
                  <MonomerGroup
                    key={groupTitle}
                    title={groupData.groups.length > 1 ? groupTitle : undefined}
                    groupName={groupData.groupName as MonomerGroups}
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
            dataTestIdDetails={`rna-accordion-details-${groupData.groupName}`}
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
