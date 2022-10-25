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

import { useState, useEffect } from 'react'
import { DialogActionButton } from 'src/script/ui/views/modal/components/document/Open/components/DialogActionButton'
import styles from './LoadingCircles.module.less'

interface Props {
  actionHasTimeout?: boolean
  onCancel: () => void
}
export const LoadingCircles = ({ actionHasTimeout, onCancel }: Props) => {
  const [loadingTimeout, setLoadingTimeout] = useState(actionHasTimeout)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loadingTimeout) setLoadingTimeout(true)
    }, 10000)

    return () => clearTimeout(timer)
  }, [loadingTimeout])

  return (
    <div className={styles.container}>
      <div className={styles.loader}>
        <span />
        <span />
        <span />
      </div>
      {loadingTimeout && (
        <div className={styles.buttonContainer}>
          <div className={styles.error}>Connection error</div>
          <DialogActionButton
            key="cancelButton"
            clickHandler={onCancel}
            disabled={false}
            styles={styles.button}
            label="Cancel"
            title="Action will be canceled"
          />
        </div>
      )}
    </div>
  )
}
