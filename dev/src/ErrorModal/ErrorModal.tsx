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
import styles from './ErrorModal.module.css'

interface ErrorModalProps {
  message: string
  close: () => void
}

const ErrorModal = ({ message, close }: ErrorModalProps): JSX.Element => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalWindow}>
        <header>Error Message</header>
        <div className={styles.modalBody}>{message}</div>
        <footer>
          <button
            className={styles.ok}
            onClick={() => {
              close()
            }}
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  )
}

export { ErrorModal }
