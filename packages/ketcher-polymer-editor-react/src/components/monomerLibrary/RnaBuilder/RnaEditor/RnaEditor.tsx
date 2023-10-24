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

import { ChangeEvent, useEffect, useState } from 'react';
import { RnaEditorCollapsed } from './RnaEditorCollapsed';
import { RnaEditorExpanded } from './RnaEditorExpanded';
import {
  ExpandButton,
  ExpandIcon,
  RnaEditorContainer,
  StyledHeader,
} from './styles';
import { useAppDispatch, useAppSelector } from 'hooks';
import {
  createNewPreset,
  RnaBuilderPresetsItem,
  savePreset,
  selectActivePreset,
  selectActiveRnaBuilderItem,
  selectIsEditMode,
  selectPresetFullName,
  selectPresets,
  setActivePreset,
  setActivePresetName,
  setActiveRnaBuilderItem,
  setHasUniqueNameError,
  setIsEditMode as setIsEditModeAction,
} from 'state/rna-builder';
import { scrollToElement } from 'helpers/dom';

export const scrollToSelectedPreset = (presetName) => {
  scrollToElement(`[data-rna-preset-item-name="${presetName}"]`);
};

export const scrollToSelectedMonomer = (monomerId) => {
  scrollToElement(`[data-monomer-item-id="${monomerId}"]`);
};

export const RnaEditor = ({ duplicatePreset, activateEditMode }) => {
  const activePreset = useAppSelector(selectActivePreset);
  const presets = useAppSelector(selectPresets);
  const isEditMode = useAppSelector(selectIsEditMode);
  const activePresetFullName = selectPresetFullName(activePreset);
  const activeMonomerGroup = useAppSelector(selectActiveRnaBuilderItem);
  const [, setPresetName] = useState('');
  const [editedPresetName, setEditedPresetName] = useState(false);

  const dispatch = useAppDispatch();
  const hasPresets = presets.length !== 0;

  const setIsEditMode = (value: boolean) => {
    dispatch(setIsEditModeAction(value));
  };

  useEffect(() => {
    if (activePreset) return;

    if (hasPresets) {
      dispatch(setActivePreset(presets[0]));
    } else {
      dispatch(createNewPreset());
      dispatch(setActiveRnaBuilderItem(RnaBuilderPresetsItem.Presets));
      setIsEditMode(true);
    }
  }, []);

  const [expanded, setExpanded] = useState(true);

  const expandEditor = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    if (
      activeMonomerGroup !== RnaBuilderPresetsItem.Presets &&
      !editedPresetName
    ) {
      setPresetName(activePresetFullName);
      dispatch(setActivePresetName(activePresetFullName));
    }
  }, [activeMonomerGroup, activePresetFullName, editedPresetName]);

  const onChangeName = (event: ChangeEvent<HTMLInputElement>) => {
    if (isEditMode) {
      const newPresetName = event.target.value;
      dispatch(setActivePresetName(newPresetName));
      setPresetName(newPresetName);
      setEditedPresetName(newPresetName.trim() !== '');
    }
  };

  const saveActivePreset = () => {
    const presetWithSameName = presets.find(
      (preset) => preset.name === activePreset.name,
    );
    if (
      presetWithSameName &&
      activePreset.presetInList !== presetWithSameName
    ) {
      dispatch(setHasUniqueNameError(true));
      return;
    }
    dispatch(savePreset(activePreset));
    setIsEditMode(false);
    setTimeout(() => {
      scrollToSelectedPreset(activePreset.name);
    }, 0);
  };

  const cancelEdit = () => {
    if (presets.length === 0 || !activePreset.presetInList) {
      dispatch(createNewPreset());
    } else {
      dispatch(setActivePreset(activePreset.presetInList));
    }

    if (!activePreset.presetInList) {
      dispatch(setActivePreset(presets[0]));
    }

    setIsEditMode(false);
  };

  return (
    <RnaEditorContainer>
      <StyledHeader>
        RNA Builder
        <ExpandButton onClick={expandEditor}>
          <ExpandIcon expanded={expanded} name="chevron" />
        </ExpandButton>
      </StyledHeader>
      {activePreset ? (
        expanded ? (
          <RnaEditorExpanded
            name={activePreset.name}
            isEditMode={isEditMode}
            onChangeName={onChangeName}
            onSave={saveActivePreset}
            onCancel={cancelEdit}
            onEdit={activateEditMode}
            onDuplicate={duplicatePreset}
          />
        ) : (
          <RnaEditorCollapsed
            name={activePreset.name}
            fullName={activePresetFullName}
          />
        )
      ) : (
        <></>
      )}
    </RnaEditorContainer>
  );
};
