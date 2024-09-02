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
  selectUnsplitNucleotides,
  selectAmbiguousMonomersInCategory,
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
  selectFilteredPresets,
  selectIsActivePresetNewAndEmpty,
  selectIsEditMode,
  setActivePresetMonomerGroup,
  setActiveRnaBuilderItem,
  setBaseValidations,
  setIsEditMode,
  setPhosphateValidations,
  setSugarValidations,
} from 'state/rna-builder';
import { useDispatch } from 'react-redux';
import { IRnaPreset } from '../types';
import {
  isAmbiguousMonomerLibraryItem,
  KetMonomerClass,
  MonomerItemType,
} from 'ketcher-core';
import {
  selectEditor,
  selectIsSequenceEditInRNABuilderMode,
} from 'state/common';
import { RnaPresetGroup } from 'components/monomerLibrary/RnaPresetGroup/RnaPresetGroup';
import { getValidations } from 'helpers/rnaValidations';

interface IGroupsDataItem {
  groupName: MonomerGroups | RnaBuilderPresetsItem;
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
  const nucleotideItems = selectUnsplitNucleotides(monomers);
  const nucleotideGroups = selectMonomerGroups(nucleotideItems);
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
  const [newPreset, setNewPreset] = useState(activePreset);
  const [activeMonomerKey, setActiveMonomerKey] = useState('');

  const dispatch = useDispatch();
  const handleAccordionSummaryClick = (rnaBuilderItem: RnaBuilderItem) => {
    if (expandedAccordion === rnaBuilderItem) {
      setExpandedAccordion(null);
    } else {
      setExpandedAccordion(rnaBuilderItem);
      const { sugarValidations, phosphateValidations, baseValidations } =
        getValidations(newPreset);

      dispatch(setSugarValidations(sugarValidations));
      dispatch(setPhosphateValidations(phosphateValidations));
      dispatch(setBaseValidations(baseValidations));
    }
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
      groups: groups
        .filter(
          (group) =>
            MonomerCodeToGroup[group.groupTitle as MonomerGroupCodes] ===
            MonomerGroups.BASES,
        )
        .map((group) => {
          return {
            ...group,
            groupItems: group.groupItems.filter(
              (item) => item.props?.MonomerClass !== KetMonomerClass.RNA,
            ),
          };
        }),
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
    {
      groupName: MonomerGroups.NUCLEOTIDES,
      iconName: 'nucleotide',
      groups: nucleotideGroups,
    },
  ];

  const selectItem = (monomer, groupName) => {
    setActiveMonomerKey(getMonomerUniqueKey(monomer));

    if (!isSequenceEditInRNABuilderMode && !isEditMode) {
      editor.events.selectMonomer.dispatch(monomer);
    }

    if (!isEditMode) {
      return;
    }

    const monomerClass = isAmbiguousMonomerLibraryItem(monomer)
      ? monomer.monomers[0].monomerItem.props.MonomerClass?.toLowerCase()
      : monomer.props.MonomerClass.toLowerCase();
    const currentPreset = {
      ...newPreset,
      [monomerClass]: monomer,
    };
    setNewPreset(currentPreset);
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
        const variantMonomers = selectAmbiguousMonomersInCategory(
          monomers,
          groupData.groupName as MonomerGroups,
        );
        const quantity = [...groupData.groups, ...variantMonomers].reduce(
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
              <>
                {groupData.groups.map(({ groupItems, groupTitle }) => {
                  return (
                    <MonomerGroup
                      key={groupTitle}
                      title={
                        groupData.groups.length > 1 ? groupTitle : undefined
                      }
                      groupName={groupData.groupName as MonomerGroups}
                      items={groupItems as MonomerItemType[]}
                      selectedMonomerUniqueKey={activeMonomerKey}
                      onItemClick={(monomer) =>
                        selectItem(monomer, groupData.groupName)
                      }
                    />
                  );
                })}
                {variantMonomers.map((group) => {
                  return (
                    <MonomerGroup
                      key={group.groupTitle}
                      title={group.groupTitle}
                      items={group.groupItems}
                      libraryName={libraryName}
                      selectedMonomerUniqueKey={activeMonomerKey}
                      onItemClick={(monomer) =>
                        selectItem(monomer, groupData.groupName)
                      }
                    />
                  );
                })}
              </>
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
