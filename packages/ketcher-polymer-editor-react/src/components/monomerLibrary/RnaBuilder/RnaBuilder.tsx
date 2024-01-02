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

import { RnaAccordion } from './RnaAccordion';
import { RnaEditor } from './RnaEditor';
import { RnaBuilderContainer } from './styles';
import { useAppDispatch, useAppSelector } from 'hooks';
import { selectUniqueNameError, setUniqueNameError } from 'state/rna-builder';
import { Modal } from 'components/shared/modal';
import { StyledButton } from 'components/monomerLibrary/RnaBuilder/RnaAccordion/styles';

export const RnaBuilder = ({ libraryName, duplicatePreset, editPreset }) => {
  const dispatch = useAppDispatch();
  const uniqueNameError = useAppSelector(selectUniqueNameError);
  const closeErrorModal = () => {
    dispatch(setUniqueNameError(''));
  };
  return (
    <RnaBuilderContainer>
      <RnaEditor duplicatePreset={duplicatePreset} />
      <RnaAccordion
        libraryName={libraryName}
        duplicatePreset={duplicatePreset}
        editPreset={editPreset}
      />
      <Modal
        isOpen={!!uniqueNameError}
        title="Error Message"
        onClose={closeErrorModal}
      >
        <Modal.Content>
          Preset with name "{uniqueNameError}" already exists. Please choose
          another name.
        </Modal.Content>
        <Modal.Footer>
          <StyledButton onClick={closeErrorModal}>Close</StyledButton>
        </Modal.Footer>
      </Modal>
    </RnaBuilderContainer>
  );
};
