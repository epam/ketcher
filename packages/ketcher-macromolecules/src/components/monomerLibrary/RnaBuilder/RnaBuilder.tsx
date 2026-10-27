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

import { useTranslation } from 'react-i18next';
import { RnaEditor } from './RnaEditor';
import { RnaBuilderContainer } from './styles';
import { useAppDispatch, useAppSelector, useIsCompactView } from 'hooks';
import {
  selectUniqueNameError,
  setUniqueNameError,
  selectInvalidPresetError,
  setInvalidPresetError,
  selectInvalidPresetNameError,
  setInvalidPresetNameError,
} from 'state/rna-builder';
import { Modal } from 'components/shared/modal';
import { StyledButton } from 'components/monomerLibrary/RnaBuilder/RnaElementsView/styles';
import { RnaElements } from 'components/monomerLibrary/RnaBuilder/RnaElementsView/RnaElements';

export const RnaBuilder = ({ libraryName, duplicatePreset, editPreset }) => {
  const { t } = useTranslation(['macromoleculesDialogs', 'common']);
  const dispatch = useAppDispatch();
  const uniqueNameError = useAppSelector(selectUniqueNameError);
  const invalidPresetError = useAppSelector(selectInvalidPresetError);
  const invalidPresetNameError = useAppSelector(selectInvalidPresetNameError);

  const isCompactView = useIsCompactView();

  const closeErrorModal = () => {
    if (uniqueNameError.length > 0) {
      dispatch(setUniqueNameError(''));
    }
    if (invalidPresetError.length > 0) {
      dispatch(setInvalidPresetError(''));
    }
    if (invalidPresetNameError.length > 0) {
      dispatch(setInvalidPresetNameError(''));
    }
  };

  return (
    <RnaBuilderContainer>
      <RnaEditor duplicatePreset={duplicatePreset} />
      <RnaElements
        libraryName={libraryName}
        duplicatePreset={duplicatePreset}
        editPreset={editPreset}
        view={isCompactView ? 'tabs' : 'accordion'}
      />
      <Modal
        isOpen={
          Boolean(uniqueNameError) ||
          Boolean(invalidPresetError) ||
          Boolean(invalidPresetNameError)
        }
        title={t('monomerLibrary.errorModalTitle')}
        onClose={closeErrorModal}
      >
        <Modal.Content>
          <div style={{ padding: '12px' }}>
            {uniqueNameError &&
              t('monomerLibrary.presetNameExists', { name: uniqueNameError })}
            {invalidPresetError &&
              t('monomerLibrary.invalidPreset', { name: invalidPresetError })}
            {invalidPresetNameError &&
              t('monomerLibrary.invalidPresetNameFormat')}
          </div>
        </Modal.Content>
        <Modal.Footer>
          <StyledButton onClick={closeErrorModal}>
            {t('common:button.close')}
          </StyledButton>
        </Modal.Footer>
      </Modal>
    </RnaBuilderContainer>
  );
};
