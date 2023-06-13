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

import styles from './AnalyzingFile.module.less'
import { LoadingCircles } from 'src/script/ui/views/components/Spinner'
import { Icon } from 'components'

export type AnalyzingFileProps = {
  fileName?: string
}

const ICON_NAME = 'file-thumbnail'

export const AnalyzingFile = ({ fileName }: AnalyzingFileProps) => (
  <div className={styles.analyzingFileWrapper}>
    {fileName && (
      <div className={styles.fileBox}>
        <Icon name={ICON_NAME} />
        <p>{fileName}</p>
      </div>
    )}
    <LoadingCircles />
  </div>
)
