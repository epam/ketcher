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
  savePreset,
  selectActivePreset,
  selectCurrentMonomerGroup,
  selectActivePresetMonomerGroup,
  selectActiveRnaBuilderItem,
  selectIsPresetReadyToSave,
  selectPresets,
  setActivePreset,
  setActiveRnaBuilderItem,
  setIsEditMode,
  setActivePresetMonomerGroup,
  selectPresetFullName,
  setUniqueNameError,
} from 'state/rna-builder';
import { useAppSelector } from 'hooks';
import {
  scrollToSelectedMonomer,
  scrollToSelectedPreset,
} from 'components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditor';
import { getMonomerUniqueKey } from 'state/library';
import { selectEditor } from 'state/common';
import { ChangeEvent, useEffect, useState } from 'react';

export const RnaEditorExpanded = ({
  isEditMode,
  onDuplicate,
}: IRnaEditorExpandedProps) => {
  const groupsData = [
    {
      groupName: MonomerGroups.SUGARS,
      iconName: 'sugar',
      testId: 'rna-builder-slot--sugar',
    },
    {
      groupName: MonomerGroups.BASES,
      iconName: 'base',
      testId: 'rna-builder-slot--base',
    },
    {
      groupName: MonomerGroups.PHOSPHATES,
      iconName: 'phosphate',
      testId: 'rna-builder-slot--phosphate',
    },
  ] as const;

  const dispatch = useDispatch();
  const activePreset = useAppSelector(selectActivePreset);
  const activeMonomerGroup = useAppSelector(selectActiveRnaBuilderItem);
  const editor = useAppSelector(selectEditor);
  const presets = useAppSelector(selectPresets);
  const activePresetMonomerGroup = useAppSelector(
    selectActivePresetMonomerGroup,
  );
  const [newPreset, setNewPrest] = useState(activePreset);

  const updatePresetMonomerGroup = () => {
    if (activePresetMonomerGroup) {
      const groupName =
        monomerGroupToPresetGroup[activePresetMonomerGroup.groupName];
      const currentPreset = {
        ...newPreset,
        [groupName]: activePresetMonomerGroup.groupItem,
      };
      setNewPrest(currentPreset);
      return currentPreset;
    }
    return newPreset;
  };

  useEffect(() => {
    setNewPrest(activePreset);
  }, [activePreset]);

  useEffect(() => {
    if (activeMonomerGroup !== RnaBuilderPresetsItem.Presets && isEditMode) {
      const currentPreset = updatePresetMonomerGroup();
      let presetFullName = newPreset?.name;
      if (!currentPreset.editedName) {
        presetFullName = selectPresetFullName(currentPreset);
      }
      setNewPrest({ ...currentPreset, name: presetFullName });
    }
  }, [activePresetMonomerGroup?.groupItem]);

  const scrollToActiveItemInLibrary = (selectedGroup) => {
    if (selectedGroup === RnaBuilderPresetsItem.Presets) {
      scrollToSelectedPreset(newPreset?.name);
      if (newPreset) {
        editor.events.selectPreset.dispatch(newPreset);
      }
      return;
    }

    const activeMonomerInSelectedGroup =
      newPreset[monomerGroupToPresetGroup[selectedGroup]];

    if (!activeMonomerInSelectedGroup) return;
    scrollToSelectedMonomer(getMonomerUniqueKey(activeMonomerInSelectedGroup));
  };

  const selectGroup = (selectedGroup) => () => {
    const selectedRNAPartMonomer = selectCurrentMonomerGroup(
      newPreset,
      selectedGroup,
    );
    if (selectedRNAPartMonomer) {
      editor.events.selectMonomer.dispatch(selectedRNAPartMonomer);
    }
    scrollToActiveItemInLibrary(selectedGroup);
    dispatch(setActiveRnaBuilderItem(selectedGroup));
  };

  const onChangeName = (event: ChangeEvent<HTMLInputElement>) => {
    if (isEditMode) {
      const newPresetName = event.target.value;
      setNewPrest({
        ...newPreset,
        name: newPresetName.trim(),
        editedName: true,
      });
    }
  };

  const onSave = () => {
    if (!newPreset?.name) {
      return;
    }
    const presetWithSameName = presets.find(
      (preset) => preset.name === newPreset.name,
    );
    if (
      presetWithSameName &&
      activePreset.presetInList !== presetWithSameName
    ) {
      dispatch(setUniqueNameError(newPreset.name));
      return;
    }
    dispatch(setActivePreset(newPreset));
    dispatch(savePreset(newPreset));
    editor.events.selectPreset.dispatch(newPreset);
    setTimeout(() => {
      scrollToSelectedPreset(newPreset.name);
    }, 0);
    dispatch(setIsEditMode(false));
    dispatch(setActivePresetMonomerGroup(null));
  };

  const onCancel = () => {
    setNewPrest(activePreset);
    dispatch(setIsEditMode(false));
    dispatch(setActivePresetMonomerGroup(null));
  };

  const turnOnEditMode = () => {
    dispatch(setIsEditMode(true));
  };

  const getMonomerName = (groupName: string) => {
    if (
      activePresetMonomerGroup &&
      activePresetMonomerGroup.groupName === groupName
    ) {
      return activePresetMonomerGroup.groupItem.label;
    }
    return (
      selectCurrentMonomerGroup(newPreset, groupName)?.label ||
      selectCurrentMonomerGroup(newPreset, groupName)?.props.MonomerName
    );
  };

  let mainButton;

  if (!activePreset.presetInList) {
    mainButton = (
      <StyledButton
        disabled={!selectIsPresetReadyToSave(newPreset)}
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
      <StyledButton
        data-testid="edit-btn"
        onClick={turnOnEditMode}
        disabled={activePreset.default}
      >
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
            value={newPreset?.name}
            placeholder="Name your structure"
            onChange={onChangeName}
          />
        ) : (
          <PresetName>{newPreset?.name}</PresetName>
        )}
        <NameLine
          selected={activeMonomerGroup === RnaBuilderPresetsItem.Presets}
        />
      </NameContainer>
      <GroupsContainer>
        {groupsData.map(({ groupName, iconName, testId }) => {
          return (
            <GroupBlock
              key={groupName}
              selected={activeMonomerGroup === groupName}
              groupName={groupName}
              monomerName={getMonomerName(groupName)}
              iconName={iconName}
              testid={testId}
              onClick={selectGroup(groupName)}
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
          <StyledButton
            data-testid="duplicate-btn"
            disabled={!selectIsPresetReadyToSave(newPreset)}
            onClick={() => onDuplicate(newPreset)}
          >
            Duplicate and Edit
          </StyledButton>
        )}
        {mainButton}
      </ButtonsContainer>
    </RnaEditorExpandedContainer>
  );
};
