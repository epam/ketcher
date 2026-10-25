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

import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { error } from './constants';
import { Dialog } from '../../../components';
import { PasteErrorModalBody } from './PasteErrorModalBody';

import styles from './InfoModal.module.less';

function ErrorInfoModal(properties) {
  const { t } = useTranslation(['common', 'dialogs']);
  // props.message is one of the fixed command identifiers dispatched by
  // openInfoModal('Paste' | 'Copy' | 'Cut') in state/shared.ts — not
  // display text, so compare against the literal identifier, not a
  // translatable title (see action/index.ts's `paste` action title key).
  const isPasteError = properties.message === 'Paste';

  const defaultCutCopyMessage = t('dialogs:infoModal.defaultCutCopyMessage', {
    command: properties.message,
  });

  const headerContent = <div>{properties.title ?? error.message}</div>;

  return (
    <Dialog
      className={styles.infoModal}
      params={properties}
      buttons={[
        <button
          onClick={properties.onOk}
          className={styles.ok}
          key="ok"
          data-testid={properties.testId || 'info-modal-close'}
        >
          {properties.button || t('common:button.close')}
        </button>,
      ]}
      headerContent={headerContent}
    >
      <div>
        {properties.customText ||
          (isPasteError ? <PasteErrorModalBody /> : defaultCutCopyMessage)}
      </div>
    </Dialog>
  );
}

const mapStateToProperties = (state) => ({
  errorMessage: state.options.app.errorMessage,
});

const mapDispatchToProperties = (dispatch) => ({
  onOk: (_result) => {
    dispatch({ type: 'MODAL_CLOSE' });
  },
});

const InfoModal = connect(
  mapStateToProperties,
  mapDispatchToProperties,
)(ErrorInfoModal);

export default InfoModal;
