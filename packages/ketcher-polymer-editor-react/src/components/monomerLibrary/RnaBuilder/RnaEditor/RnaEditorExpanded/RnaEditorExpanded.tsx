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

import { MonomerGroups } from 'src/constants';
import { GroupBlock } from './GroupBlock';
import {
  ButtonsContainer,
  GroupsContainer,
  NameContainer,
  NameInput,
  NameLine,
  PresetName,
  RnaEditorExpandedContainer,
  StyledButton,
} from './styles';
import { IRnaEditorExpandedProps } from 'components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditorExpanded/types';
import { useDispatch } from 'react-redux';
import {
  monomerGroupToPresetGroup,
  RnaBuilderPresetsItem,
  selectActivePreset,
  selectActivePresetMonomerGroup,
  selectActiveRnaBuilderItem,
  selectIsPresetReadyToSave,
  setActiveRnaBuilderItem,
} from 'state/rna-builder';
import { useAppSelector } from 'hooks';
import {
  scrollToSelectedMonomer,
  scrollToSelectedPreset,
} from 'components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditor';
import { getMonomerUniqueKey } from 'state/library';

export const RnaEditorExpanded = ({
  name,
  isEditMode,
  onCancel,
  onChangeName,
  onSave,
  onEdit,
  onDuplicate,
}: IRnaEditorExpandedProps) => {
  const dispatch = useDispatch();
  const activePreset = useAppSelector(selectActivePreset);
  const groupsData = [
    {
      groupName: MonomerGroups.SUGARS,
      iconName: 'sugar',
    },
    {
      groupName: MonomerGroups.BASES,
      iconName: 'base',
    },
    {
      groupName: MonomerGroups.PHOSPHATES,
      iconName: 'phosphate',
    },
  ] as const;

  const activeMonomerGroup = useAppSelector(selectActiveRnaBuilderItem);

  const scrollToActiveItemInLibrary = (selectedGroup) => {
    if (selectedGroup === RnaBuilderPresetsItem.Presets) {
      scrollToSelectedPreset(activePreset.name);
      return;
    }

    const activeMonomerInSelectedGroup =
      activePreset[monomerGroupToPresetGroup[selectedGroup]];

    if (!activeMonomerInSelectedGroup) return;
    scrollToSelectedMonomer(getMonomerUniqueKey(activeMonomerInSelectedGroup));
  };
  const selectGroup = (selectedGroup) => {
    scrollToActiveItemInLibrary(selectedGroup);
    dispatch(setActiveRnaBuilderItem(selectedGroup));
  };

  let mainButton;

  if (!activePreset.presetInList) {
    mainButton = (
      <StyledButton
        disabled={!selectIsPresetReadyToSave(activePreset)}
        primary
        data-testid="add-to-presets-btn"
        onClick={onSave}
      >
        Add to Presets
      </StyledButton>
    );
  } else if (isEditMode) {
    mainButton = (
      <StyledButton primary data-testid="save-btn" onClick={onSave}>
        Save
      </StyledButton>
    );
  } else {
    mainButton = (
      <StyledButton data-testid="edit-btn" onClick={onEdit}>
        Edit
      </StyledButton>
    );
  }

  return (
    <RnaEditorExpandedContainer data-testid="rna-editor-expanded">
      <NameContainer
        selected={activeMonomerGroup === RnaBuilderPresetsItem.Presets}
        onClick={() => selectGroup(RnaBuilderPresetsItem.Presets)}
      >
        {isEditMode ? (
          <NameInput
            value={name}
            placeholder="Name your structure"
            onChange={onChangeName}
          />
        ) : (
          <PresetName>{name}</PresetName>
        )}
        <NameLine
          selected={activeMonomerGroup === RnaBuilderPresetsItem.Presets}
        />
      </NameContainer>
      <GroupsContainer>
        {groupsData.map(({ groupName, iconName }) => {
          return (
            <GroupBlock
              key={groupName}
              selected={activeMonomerGroup === groupName}
              groupName={groupName}
              monomerName={
                selectActivePresetMonomerGroup(activePreset, groupName)
                  ?.label ||
                selectActivePresetMonomerGroup(activePreset, groupName)?.props
                  .MonomerName
              }
              iconName={iconName}
              onClick={() => selectGroup(groupName)}
            />
          );
        })}
      </GroupsContainer>
      <ButtonsContainer>
        {isEditMode ? (
          <StyledButton data-testid="cancel-btn" onClick={onCancel}>
            Cancel
          </StyledButton>
        ) : (
          <StyledButton data-testid="duplicate-btn" onClick={onDuplicate}>
            Duplicate and Edit
          </StyledButton>
        )}
        {mainButton}
      </ButtonsContainer>
    </RnaEditorExpandedContainer>
  );
};
