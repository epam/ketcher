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

import {
  buildRnaPresetConnections,
  Entities,
  getRnaPresetPhosphatePosition,
  RnaPhosphatePosition,
} from 'ketcher-core';
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
import Tooltip from '@mui/material/Tooltip';
import { getPhosphatePositionAvailability } from 'helpers/rnaValidations';
import { Icon } from 'ketcher-react';
import styles from './RnaEditorExpanded.module.less';

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
  const isSequenceMode = useLayoutMode() === 'sequence-layout-mode';
  const activePreset = useAppSelector(selectActivePreset);
  const isActivePresetEmpty = useAppSelector(selectIsActivePresetNewAndEmpty);
  const activeMonomerGroup = useAppSelector(selectActiveRnaBuilderItem);
  const editor = useAppSelector(selectEditor);
  const presets = useAppSelector(selectAllPresets);
  const activePresetMonomerGroup = useAppSelector(
    selectActivePresetMonomerGroup,
  );
  const [newPreset, setNewPreset] = useState(activePreset);
  const [selectedPhosphatePosition, setSelectedPhosphatePosition] = useState<
    RnaPhosphatePosition | undefined
  >(
    activePreset?.connections?.length
      ? getRnaPresetPhosphatePosition(activePreset)
      : undefined,
  );

  const resolvePhosphatePosition = (
    preset: typeof newPreset,
  ): RnaPhosphatePosition | undefined => {
    if (!preset?.phosphate) {
      return undefined;
    }

    const {
      is3PrimeAvailable: isRightPositionAvailable,
      is5PrimeAvailable: isLeftPositionAvailable,
    } = getPhosphatePositionAvailability(preset);

    if (selectedPhosphatePosition === 'left' && isLeftPositionAvailable) {
      return 'left';
    }

    if (selectedPhosphatePosition === 'right' && isRightPositionAvailable) {
      return 'right';
    }

    if (preset.connections?.length) {
      const presetPhosphatePosition = getRnaPresetPhosphatePosition(preset);

      if (
        (presetPhosphatePosition === 'left' && isLeftPositionAvailable) ||
        (presetPhosphatePosition === 'right' && isRightPositionAvailable)
      ) {
        return presetPhosphatePosition;
      }
    }

    if (isSequenceMode && isRightPositionAvailable) {
      return 'right';
    }

    if (isLeftPositionAvailable && !isRightPositionAvailable) {
      return 'left';
    }

    if (isRightPositionAvailable && !isLeftPositionAvailable) {
      return 'right';
    }

    return undefined;
  };

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
  const phosphatePosition = resolvePhosphatePosition(newPreset);
  const { is3PrimeAvailable, is5PrimeAvailable } =
    getPhosphatePositionAvailability(newPreset || {});
  const isPhosphateOrientationRequired =
    Boolean(newPreset?.phosphate) && is3PrimeAvailable && is5PrimeAvailable;
  const saveButtonDisabledByPhosphatePosition =
    !phosphatePosition && isPhosphateOrientationRequired;
  const saveButtonDisabledTooltip = saveButtonDisabledByPhosphatePosition
    ? 'Before saving you must choose the position of the phosphate.'
    : '';
  const phosphatePositionDisabledTooltip = {
    left: 'Sugar must have R1, and phosphate must have R2.',
    right: 'Sugar must have R2, and phosphate must have R1.',
  };

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
    setSelectedPhosphatePosition(
      activePreset?.connections?.length
        ? getRnaPresetPhosphatePosition(activePreset)
        : undefined,
    );
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
        const resolvedPhosphatePosition =
          resolvePhosphatePosition(currentPreset);
        let presetFullName = newPreset?.name;

        if (!currentPreset.editedName) {
          presetFullName = selectPresetFullName({
            ...currentPreset,
            connections: buildRnaPresetConnections(
              currentPreset,
              resolvedPhosphatePosition,
            ),
          });
        }

        setNewPreset({ ...currentPreset, name: presetFullName });
      }
    }
  }, [
    activePresetMonomerGroup?.groupItem,
    isSequenceEditInRNABuilderMode,
    selectedPhosphatePosition,
  ]);

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
      recalculateRnaBuilderValidations({
        rnaPreset: newPreset,
        isEditMode,
        selectedPhosphatePosition,
      }),
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

  const setPhosphatePosition = (position?: RnaPhosphatePosition) => {
    setSelectedPhosphatePosition(position);
    dispatch(
      recalculateRnaBuilderValidations({
        rnaPreset: newPreset,
        isEditMode,
        selectedPhosphatePosition: position,
      }),
    );
  };

  const renderPhosphateTriggerIcon = (
    position: RnaPhosphatePosition,
    isActive = false,
    highlightOnHover = false,
  ) => {
    return (
      <div
        className={clsx(
          styles.phosphatePositionIconWrapper,
          isActive && styles.active,
          highlightOnHover && styles.hover,
        )}
      >
        {position === 'left' ? (
          <Icon name="preset-left-phosphate" />
        ) : (
          <Icon name="preset-right-phosphate" />
        )}
      </div>
    );
  };

  const renderPhosphatePositionOption = (
    position: RnaPhosphatePosition,
    isDisabled: boolean,
  ) => (
    <Tooltip
      key={position}
      title={isDisabled ? phosphatePositionDisabledTooltip[position] : ''}
    >
      <span>
        <button
          type="button"
          className={clsx(
            styles.phosphatePositionOption,
            isDisabled && styles.phosphatePositionOptionDisabled,
          )}
          disabled={isDisabled}
          onClick={() => {
            setPhosphatePosition(position);
          }}
        >
          {renderPhosphateTriggerIcon(position, false, true)}
        </button>
      </span>
    </Tooltip>
  );

  const getPhosphatePositionTooltip = (position: RnaPhosphatePosition) =>
    position === 'left' ? 'Phosphate on the left' : 'Phosphate on the right';

  const renderPhosphatePositionSelector = (position?: RnaPhosphatePosition) => {
    if (!newPreset?.phosphate) {
      return null;
    }

    const triggerDisabled = !is5PrimeAvailable && !is3PrimeAvailable;
    const triggerPosition = position ?? selectedPhosphatePosition ?? 'right';
    const isPhosphateGroupActive =
      activeMonomerGroup === MonomerGroups.PHOSPHATES;
    const showPhosphatePositionTooltip = !isEditMode || !isPhosphateGroupActive;

    return (
      <div
        className={clsx(
          styles.phosphatePositionIconWrapperOnPresetCard,
          isPhosphateGroupActive &&
            !triggerDisabled &&
            styles.phosphatePositionIconWrapperOnPresetCardActive,
        )}
      >
        <Tooltip
          title={
            showPhosphatePositionTooltip
              ? getPhosphatePositionTooltip(triggerPosition)
              : ''
          }
        >
          <span>
            <button
              type="button"
              className={styles.phosphatePositionTrigger}
              disabled={triggerDisabled}
              aria-label="Select phosphate position"
            >
              {renderPhosphateTriggerIcon(
                triggerPosition,
                isPhosphateGroupActive,
              )}
            </button>
          </span>
        </Tooltip>
        {!triggerDisabled && !showPhosphatePositionTooltip ? (
          <div className={styles.phosphatePositionSelector}>
            {renderPhosphatePositionOption('left', !is5PrimeAvailable)}
            {renderPhosphatePositionOption('right', !is3PrimeAvailable)}
          </div>
        ) : null}
      </div>
    );
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

    const resolvedPhosphatePosition = resolvePhosphatePosition(newPreset);

    if (newPreset?.phosphate && !resolvedPhosphatePosition) {
      return;
    }

    const presetToSave = {
      ...newPreset,
      connections: buildRnaPresetConnections(
        newPreset,
        resolvedPhosphatePosition,
      ),
    };

    const presetWithSameName = presets.find(
      (preset) => preset.name === presetToSave.name,
    );
    if (
      presetWithSameName &&
      activePreset.nameInList !== presetWithSameName.name
    ) {
      dispatch(setUniqueNameError(presetToSave.name));
      return;
    }
    dispatch(savePreset(presetToSave));
    dispatch(setActivePreset(presetToSave));
    if (!isSequenceMode) {
      editor?.events.selectPreset.dispatch(presetToSave);
    }
    setTimeout(() => {
      scrollToSelectedPreset(presetToSave.name);
    }, 0);
    resetRnaBuilder(dispatch);
  };

  const onCancel = () => {
    if (isSequenceEditInRNABuilderMode) {
      resetRnaBuilderAfterSequenceUpdate(dispatch, editor);
    } else {
      setNewPreset(activePreset);
      setSelectedPhosphatePosition(
        activePreset?.connections?.length
          ? getRnaPresetPhosphatePosition(activePreset)
          : undefined,
      );
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
    const result =
      selectCurrentMonomerGroup(newPreset, groupName)?.label ??
      selectCurrentMonomerGroup(newPreset, groupName)?.props.MonomerName;
    return result || undefined;
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
  const isSaveButtonDisabled =
    !selectIsPresetReadyToSave(newPreset) ||
    saveButtonDisabledByPhosphatePosition;

  if (isActivePresetEmpty && !isSequenceEditInRNABuilderMode) {
    mainButton = (
      <Tooltip title={saveButtonDisabledTooltip}>
        <StyledButton
          disabled={isSaveButtonDisabled}
          primary
          data-testid="add-to-presets-btn"
          onClick={onSave}
        >
          Add to Presets
        </StyledButton>
      </Tooltip>
    );
  } else if (isEditMode) {
    mainButton = (
      <Tooltip title={saveButtonDisabledTooltip}>
        <StyledButton
          primary
          disabled={
            isSequenceEditInRNABuilderMode
              ? !isSequenceSelectionUpdated
              : isSaveButtonDisabled
          }
          data-testid="save-btn"
          onClick={isSequenceEditInRNABuilderMode ? onUpdateSequence : onSave}
        >
          {isSequenceEditInRNABuilderMode ? 'Update' : 'Save'}
        </StyledButton>
      </Tooltip>
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
          const isPhosphateGroup = groupName === MonomerGroups.PHOSPHATES;

          return (
            <GroupBlock
              selected={activeMonomerGroup === groupName}
              groupName={groupName}
              key={groupName}
              monomerName={
                isSequenceEditInRNABuilderMode
                  ? getMonomersName(groupName)
                  : getMonomerName(groupName)
              }
              iconName={iconName}
              testid={testId}
              onClick={selectGroup(groupName)}
            >
              {isPhosphateGroup
                ? renderPhosphatePositionSelector(phosphatePosition)
                : null}
            </GroupBlock>
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
