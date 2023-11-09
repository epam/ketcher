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

import { useEffect } from 'react';
import { RnaAccordion } from './RnaAccordion';
import { RnaEditor } from './RnaEditor';
import { RnaBuilderContainer } from './styles';
import { useAppDispatch, useAppSelector } from 'hooks';
import {
  selectActivePreset,
  selectHasUniqueNameError,
  setHasUniqueNameError,
  setDefaultPresets,
  setActivePreset,
  setIsEditMode,
  savePreset,
} from 'state/rna-builder';
import { selectFilteredMonomers } from 'state/library';
import { Modal } from 'components/shared/modal';
import { getDefaultPresets } from 'src/helpers/getDefaultPreset';
import { StyledButton } from 'components/monomerLibrary/RnaBuilder/RnaAccordion/styles';
import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';
import { scrollToSelectedPreset } from './RnaEditor/RnaEditor';

export const RnaBuilder = ({ libraryName }) => {
  const dispatch = useAppDispatch();
  const hasError = useAppSelector(selectHasUniqueNameError);
  const monomers = useAppSelector(selectFilteredMonomers);
  const activePreset = useAppSelector(selectActivePreset);
  const closeErrorModal = () => {
    dispatch(setHasUniqueNameError(false));
  };

  useEffect(() => {
    const defaultPresets: IRnaPreset[] = getDefaultPresets(monomers);
    dispatch(setDefaultPresets(defaultPresets));
  }, [dispatch]);

  const duplicatePreset = (preset?: IRnaPreset) => {
    const duplicatedPreset = {
      ...(preset || activePreset),
      presetInList: undefined,
      name: `${preset?.name || activePreset.name}_Copy`,
      default: false,
    };
    dispatch(setActivePreset(duplicatedPreset));
    dispatch(savePreset(duplicatedPreset));
    dispatch(setIsEditMode(true));
    scrollToSelectedPreset(activePreset.name);
  };

  const activateEditMode = () => {
    dispatch(setIsEditMode(true));
  };

  const editPreset = (preset: IRnaPreset) => {
    dispatch(setActivePreset(preset));
    activateEditMode();
  };

  return (
    <RnaBuilderContainer>
      <RnaEditor
        duplicatePreset={duplicatePreset}
        activateEditMode={activateEditMode}
      />
      <RnaAccordion
        libraryName={libraryName}
        duplicatePreset={duplicatePreset}
        editPreset={editPreset}
      />
      <Modal isOpen={hasError} title="Error Message" onClose={closeErrorModal}>
        <Modal.Content>
          Preset with name "{activePreset?.name}" already exists. Please choose
          another name.
        </Modal.Content>
        <Modal.Footer>
          <StyledButton onClick={closeErrorModal}>Close</StyledButton>
        </Modal.Footer>
      </Modal>
    </RnaBuilderContainer>
  );
};
