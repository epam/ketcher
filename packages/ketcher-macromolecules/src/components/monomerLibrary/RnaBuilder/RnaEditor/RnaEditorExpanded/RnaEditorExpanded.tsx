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
  selectActivePresets,
  selectActivePresetsName,
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
  selectIsOpenedBySequence,
} from 'state/rna-builder';
import { useAppSelector } from 'hooks';
import {
  scrollToSelectedMonomer,
  scrollToSelectedPreset,
} from 'components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditor';
import { getMonomerUniqueKey } from 'state/library';
import { selectEditor } from 'state/common';
import { ChangeEvent, useEffect, useState } from 'react';
import { generatePresetsGroupNames } from 'components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditorExpanded/helpers/presetsGroup';

type NewPresetsGroupNames = {
  [MonomerGroups.SUGARS]: string;
  [MonomerGroups.BASES]: string;
  [MonomerGroups.PHOSPHATES]: string;
};

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
  const activePresets = useAppSelector(selectActivePresets);
  const activePresetsName = useAppSelector(selectActivePresetsName);
  const activeMonomerGroup = useAppSelector(selectActiveRnaBuilderItem);
  const editor = useAppSelector(selectEditor);
  const presets = useAppSelector(selectPresets);
  const isOpenedBySequence = useAppSelector(selectIsOpenedBySequence);
  const activePresetMonomerGroup = useAppSelector(
    selectActivePresetMonomerGroup,
  );
  const [newPreset, setNewPreset] = useState(activePreset);
  const [newPresets, setNewPresets] = useState(activePresets);
  const [newPresetsGroupNames, setNewPresetsGroupNames] = useState<
    NewPresetsGroupNames | undefined
  >(generatePresetsGroupNames(activePresets));

  const updatePresetMonomerGroup = () => {
    if (activePresetMonomerGroup) {
      const groupName =
        monomerGroupToPresetGroup[activePresetMonomerGroup.groupName];
      const currentPreset = {
        ...newPreset,
        [groupName]: activePresetMonomerGroup.groupItem,
      };
      setNewPreset(currentPreset);
      return currentPreset;
    }
    return newPreset;
  };

  useEffect(() => {
    setNewPreset(activePreset);
  }, [activePreset]);

  useEffect(() => {
    setNewPresets(activePresets);
  }, [activePresets]);

  useEffect(() => {
    setNewPresetsGroupNames(generatePresetsGroupNames(newPresets));
  }, [newPresets]);

  useEffect(() => {
    if (activeMonomerGroup !== RnaBuilderPresetsItem.Presets && isEditMode) {
      if (isOpenedBySequence && activePresetMonomerGroup) {
        const monomerType =
          monomerGroupToPresetGroup[activePresetMonomerGroup.groupName];
        const updatedNewPresets = newPresets.map((preset) => {
          return {
            ...preset,
            [monomerType]: activePresetMonomerGroup.groupItem,
          };
        });
        setNewPresets(updatedNewPresets);
      } else {
        const currentPreset = updatePresetMonomerGroup();
        let presetFullName = newPreset?.name;
        if (!currentPreset.editedName) {
          presetFullName = selectPresetFullName(currentPreset);
        }
        setNewPreset({ ...currentPreset, name: presetFullName });
      }
    }
  }, [activePresetMonomerGroup?.groupItem, isOpenedBySequence]);

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
      setNewPreset({
        ...newPreset,
        name: newPresetName.trim(),
        editedName: true,
      });
    }
  };

  // TODO: update
  const onUpdateForSequence = () => {
    console.log(
      '== onUpdateForSequence modifySequenceInRnaBuilder.dispatch newPresets',
      newPresets,
    );
    editor.events.modifySequenceInRnaBuilder.dispatch(newPresets);
    setNewPresets([]);
    // TODO: add resets?
    // dispatch(setIsEditMode(false));
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
    setNewPreset(activePreset);
    setNewPresets([]);
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

  const getMonomersName = (groupName: string) => {
    if (!newPresetsGroupNames) return '';

    return getMonomerName(groupName) || newPresetsGroupNames[groupName];
  };

  let mainButton;

  if (!activePreset.presetInList && !isOpenedBySequence) {
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
      <StyledButton
        primary
        data-testid="save-btn"
        onClick={isOpenedBySequence ? onUpdateForSequence : onSave}
      >
        {isOpenedBySequence ? 'Update' : 'Save'}
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
            value={isOpenedBySequence ? activePresetsName : newPreset?.name}
            placeholder="Name your structure"
            disabled={isOpenedBySequence}
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
              monomerName={
                isOpenedBySequence
                  ? getMonomersName(groupName)
                  : getMonomerName(groupName)
              }
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
