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

import { error } from './constants';

import styles from './InfoModal.module.less';

interface InfoModalProps {
  message: string;
  close: () => void;
}

const InfoModal = ({ message, close }: InfoModalProps): JSX.Element => {
  return (
    <div className={styles.infoModalOverlay}>
      <div
        className={styles.infoModalWindow}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-label"
        aria-describedby="dialog-content"
        data-testid="info-modal-window"
      >
        <header id="dialog-label">{error.message}</header>
        <div
          className={styles.infoModalBody}
          id="dialog-content"
          data-testid="info-modal-body"
        >
          {message}
        </div>
        <footer>
          <button className={styles.ok} onClick={close}>
            {error.close}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default InfoModal;
