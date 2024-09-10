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

import { useEffect, useState } from 'react';
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
  selectActivePreset,
  selectIsEditMode,
  selectPresetFullName,
  setActiveRnaBuilderItem,
  setBaseValidations,
  setIsEditMode,
  setPhosphateValidations,
  setSugarValidations,
} from 'state/rna-builder';
import { scrollToElement } from 'helpers/dom';
import { selectIsSequenceEditInRNABuilderMode } from 'state/common';
import { getValidations } from 'helpers/rnaValidations';

export const scrollToSelectedPreset = (presetName) => {
  scrollToElement(`[data-rna-preset-item-name="${presetName}"]`);
};

export const scrollToSelectedMonomer = (monomerId) => {
  scrollToElement(`[data-monomer-item-id="${monomerId}"]`);
};

export const RnaEditor = ({ duplicatePreset }) => {
  const activePreset = useAppSelector(selectActivePreset);
  const isEditMode = useAppSelector(selectIsEditMode);
  const isSequenceEditInRNABuilderMode = useAppSelector(
    selectIsSequenceEditInRNABuilderMode,
  );
  const activePresetFullName = selectPresetFullName(activePreset);

  const dispatch = useAppDispatch();

  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (activePreset) {
      if (activePreset.name || isEditMode) setExpanded(true);
      return;
    }

    dispatch(createNewPreset());
    dispatch(setActiveRnaBuilderItem(RnaBuilderPresetsItem.Presets));
  }, [activePreset]);

  useEffect(() => {
    const { sugarValidations, phosphateValidations, baseValidations } =
      getValidations(activePreset, isEditMode);

    dispatch(setSugarValidations(sugarValidations));
    dispatch(setPhosphateValidations(phosphateValidations));
    dispatch(setBaseValidations(baseValidations));
  }, [isEditMode]);

  const expandEditor = () => {
    setExpanded(!expanded);
    if (!activePreset?.nameInList) {
      dispatch(setIsEditMode(true));
    }
  };

  return (
    <RnaEditorContainer>
      <StyledHeader
        className={
          isSequenceEditInRNABuilderMode
            ? 'styled-header--sequence-edit-mode'
            : ''
        }
      >
        RNA Builder
        <ExpandButton onClick={expandEditor}>
          <ExpandIcon expanded={expanded} name="chevron" />
        </ExpandButton>
      </StyledHeader>
      {activePreset ? (
        expanded ? (
          <RnaEditorExpanded
            isEditMode={isEditMode}
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
