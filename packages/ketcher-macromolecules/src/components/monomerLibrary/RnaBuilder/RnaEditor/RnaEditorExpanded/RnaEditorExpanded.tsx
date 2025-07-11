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

import { Entities } from 'ketcher-core';
import { MonomerGroups } from 'src/constants';
import { GroupBlock } from './GroupBlock';
import {
  ButtonsContainer,
  CompactViewName,
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
  selectSequenceSelection,
  selectSequenceSelectionName,
  selectCurrentMonomerGroup,
  selectActivePresetMonomerGroup,
  selectActiveRnaBuilderItem,
  selectIsPresetReadyToSave,
  selectAllPresets,
  setActivePreset,
  setActiveRnaBuilderItem,
  setIsEditMode,
  selectPresetFullName,
  setUniqueNameError,
  setSequenceSelection,
  setSequenceSelectionName,
  selectIsActivePresetNewAndEmpty,
  recalculateRnaBuilderValidations,
  setActiveMonomerKey,
} from 'state/rna-builder';
import { useAppSelector, useIsCompactView, useLayoutMode } from 'hooks';
import {
  scrollToSelectedMonomer,
  scrollToSelectedPreset,
} from 'components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditor';
import { getMonomerUniqueKey } from 'state/library';
import {
  selectEditor,
  selectIsSequenceEditInRNABuilderMode,
} from 'state/common';
import { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';
import {
  generateSequenceSelectionGroupNames,
  generateSequenceSelectionName,
  resetRnaBuilder,
  resetRnaBuilderAfterSequenceUpdate,
} from 'components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditorExpanded/helpers';
import { openModal } from 'state/modal';
import { getCountOfNucleoelements } from 'helpers/countNucleoelents';
import clsx from 'clsx';

type SequenceSelectionGroupNames = {
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
  const isActivePresetEmpty = useAppSelector(selectIsActivePresetNewAndEmpty);
  const activeMonomerGroup = useAppSelector(selectActiveRnaBuilderItem);
  const editor = useAppSelector(selectEditor);
  const presets = useAppSelector(selectAllPresets);
  const activePresetMonomerGroup = useAppSelector(
    selectActivePresetMonomerGroup,
  );
  const [newPreset, setNewPreset] = useState(activePreset);

  // For sequence edit in RNA Builder mode
  const sequenceSelection = useAppSelector(selectSequenceSelection);
  const sequenceSelectionName = useAppSelector(selectSequenceSelectionName);
  const isSequenceEditInRNABuilderMode = useAppSelector(
    selectIsSequenceEditInRNABuilderMode,
  );
  const [isSequenceSelectionUpdated, setIsSequenceSelectionUpdated] =
    useState<boolean>(false);
  const [sequenceSelectionGroupNames, setSequenceSelectionGroupNames] =
    useState<SequenceSelectionGroupNames | undefined>(
      generateSequenceSelectionGroupNames(sequenceSelection),
    );

  const isSequenceMode = useLayoutMode() === 'sequence-layout-mode';

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
    if (!sequenceSelection) return;
    // If modifying 1 Nucleotide or 1 Nucleoside or Nucleoside with Phosphate in sequence
    if (getCountOfNucleoelements(sequenceSelection) === 1) {
      dispatch(
        setSequenceSelectionName(
          generateSequenceSelectionName(sequenceSelection),
        ),
      );
    }
    setSequenceSelectionGroupNames(
      generateSequenceSelectionGroupNames(sequenceSelection),
    );
  }, [dispatch, sequenceSelection]);

  useEffect(() => {
    if (activeMonomerGroup !== RnaBuilderPresetsItem.Presets && isEditMode) {
      if (isSequenceEditInRNABuilderMode && activePresetMonomerGroup) {
        const monomerType =
          monomerGroupToPresetGroup[activePresetMonomerGroup.groupName];
        const field = `${monomerType}Label`;

        const updatedSequenceSelection = sequenceSelection.map((node) => {
          // Do not set 'phosphateLabel' for Nucleoside if it is connected and selected with Phosphate
          // Do not set 'sugarLabel', 'baseLabel' for Phosphate
          if (
            (node.isNucleosideConnectedAndSelectedWithPhosphate &&
              field === 'phosphateLabel') ||
            (node.type === Entities.Phosphate &&
              (field === 'sugarLabel' || field === 'baseLabel'))
          ) {
            return node;
          }

          return {
            ...node,
            [field]: activePresetMonomerGroup.groupItem.label,
            rnaBaseMonomerItem:
              activePresetMonomerGroup.groupName === 'Bases'
                ? activePresetMonomerGroup.groupItem
                : node.rnaBaseMonomerItem,
          };
        });

        setIsSequenceSelectionUpdated(true);
        dispatch(setSequenceSelection(updatedSequenceSelection));
      } else {
        const currentPreset = updatePresetMonomerGroup();
        let presetFullName = newPreset?.name;
        if (!currentPreset.editedName) {
          presetFullName = selectPresetFullName(currentPreset);
        }
        setNewPreset({ ...currentPreset, name: presetFullName });
      }
    }
  }, [activePresetMonomerGroup?.groupItem, isSequenceEditInRNABuilderMode]);

  const scrollToActiveItemInLibrary = (selectedGroup, selectedMonomer) => {
    if (selectedGroup === RnaBuilderPresetsItem.Presets) {
      scrollToSelectedPreset(newPreset?.name);
      if (newPreset) {
        editor?.events.selectPreset.dispatch(newPreset);
      }
      return;
    }

    const activeMonomerInSelectedGroup =
      newPreset[monomerGroupToPresetGroup[selectedGroup]];

    if (activeMonomerInSelectedGroup) {
      scrollToSelectedMonomer(
        getMonomerUniqueKey(activeMonomerInSelectedGroup),
      );
    } else if (selectedMonomer) {
      scrollToSelectedMonomer(selectedMonomer);
    }
  };

  const selectGroup = (selectedGroup) => () => {
    const selectedRNAPartMonomer = selectCurrentMonomerGroup(
      newPreset,
      selectedGroup,
    );

    if (selectedRNAPartMonomer && !isSequenceMode) {
      editor?.events.selectMonomer.dispatch(selectedRNAPartMonomer);
    }

    if (newPreset[monomerGroupToPresetGroup[selectedGroup]]) {
      dispatch(
        setActiveMonomerKey(
          getMonomerUniqueKey(
            newPreset[monomerGroupToPresetGroup[selectedGroup]],
          ),
        ),
      );
    }

    dispatch(setActiveRnaBuilderItem(selectedGroup));
    dispatch(
      recalculateRnaBuilderValidations({ rnaPreset: newPreset, isEditMode }),
    );

    // If all the selected nodes in sequence have the same base, set the monomer as active in the library
    let selectedMonomer = '';
    if (isSequenceEditInRNABuilderMode && sequenceSelection.length > 0) {
      const firstBaseLabel = sequenceSelection[0].baseLabel;
      const allBasesSame =
        firstBaseLabel &&
        sequenceSelection.every((node) => node.baseLabel === firstBaseLabel);

      if (allBasesSame) {
        const baseMonomerItem = sequenceSelection[0].rnaBaseMonomerItem;
        if (baseMonomerItem) {
          selectedMonomer = getMonomerUniqueKey(baseMonomerItem);
          dispatch(setActiveMonomerKey(selectedMonomer));
        }
      }
    }

    /*
     * setTimeout is needed here to wait for the selected group to be switched first (in tab or accordion view)
     * Then scroll to the selected item in the library will be possible, otherwise it won't be present in the DOM
     * Perhaps not the best approach, consider refactoring
     */
    setTimeout(
      () => scrollToActiveItemInLibrary(selectedGroup, selectedMonomer),
      100,
    );
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

  const onUpdateSequence = () => {
    if (getCountOfNucleoelements(sequenceSelection) > 1) {
      dispatch(openModal('updateSequenceInRNABuilder'));
    } else {
      editor?.events.modifySequenceInRnaBuilder.dispatch(sequenceSelection);
      resetRnaBuilderAfterSequenceUpdate(dispatch, editor);
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
      activePreset.nameInList !== presetWithSameName.name
    ) {
      dispatch(setUniqueNameError(newPreset.name));
      return;
    }
    dispatch(savePreset(newPreset));
    dispatch(setActivePreset(newPreset));
    if (!isSequenceMode) {
      editor?.events.selectPreset.dispatch(newPreset);
    }
    setTimeout(() => {
      scrollToSelectedPreset(newPreset.name);
    }, 0);
    resetRnaBuilder(dispatch);
  };

  const onCancel = () => {
    if (isSequenceEditInRNABuilderMode) {
      resetRnaBuilderAfterSequenceUpdate(dispatch, editor);
    } else {
      setNewPreset(activePreset);
      resetRnaBuilder(dispatch);
    }
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
    if (!sequenceSelectionGroupNames) return '';

    return sequenceSelectionGroupNames[groupName];
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
        event.preventDefault();
        event.stopPropagation();
      } else if (event.key === 'Enter') {
        isSequenceEditInRNABuilderMode
          ? onUpdateSequence()
          : editor?.events.startNewSequence.dispatch({});
        event.preventDefault();
        event.stopPropagation();
      }
    };
    editor?.events.keyDown.add(handleKeyDown);
    return () => {
      editor?.events.keyDown.remove(handleKeyDown);
    };
  }, [editor, sequenceSelection]);

  let mainButton: JSX.Element;

  if (isActivePresetEmpty && !isSequenceEditInRNABuilderMode) {
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
        disabled={
          isSequenceEditInRNABuilderMode ? !isSequenceSelectionUpdated : false
        }
        data-testid="save-btn"
        onClick={isSequenceEditInRNABuilderMode ? onUpdateSequence : onSave}
      >
        {isSequenceEditInRNABuilderMode ? 'Update' : 'Save'}
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

  const isCompactView = useIsCompactView();

  return (
    <RnaEditorExpandedContainer
      data-testid="rna-editor-expanded"
      className={clsx(
        isSequenceEditInRNABuilderMode &&
          'rna-editor-expanded--sequence-edit-mode',
      )}
    >
      {isCompactView ? (
        <CompactViewName
          value={
            isSequenceEditInRNABuilderMode
              ? sequenceSelectionName
              : newPreset?.name
          }
          placeholder="Name your structure"
          data-testid="name-your-structure-editbox"
          disabled={isSequenceEditInRNABuilderMode}
          onChange={onChangeName}
        />
      ) : (
        <NameContainer
          selected={activeMonomerGroup === RnaBuilderPresetsItem.Presets}
          onClick={() => selectGroup(RnaBuilderPresetsItem.Presets)}
        >
          {isEditMode ? (
            <NameInput
              value={
                isSequenceEditInRNABuilderMode
                  ? sequenceSelectionName
                  : newPreset?.name
              }
              placeholder="Name your structure"
              data-testid="name-your-structure-editbox"
              disabled={isSequenceEditInRNABuilderMode}
              onChange={onChangeName}
            />
          ) : (
            <PresetName>{newPreset?.name}</PresetName>
          )}
          <NameLine
            selected={activeMonomerGroup === RnaBuilderPresetsItem.Presets}
          />
        </NameContainer>
      )}
      <GroupsContainer compact={isCompactView}>
        {groupsData.map(({ groupName, iconName, testId }) => {
          return (
            <GroupBlock
              key={groupName}
              selected={activeMonomerGroup === groupName}
              groupName={groupName}
              monomerName={
                isSequenceEditInRNABuilderMode
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
