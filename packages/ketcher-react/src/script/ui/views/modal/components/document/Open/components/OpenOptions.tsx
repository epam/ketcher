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

import { FC } from 'react'

import Icon from 'src/script/ui/component/view/icon'
import styles from './OpenOptions.module.less'
import { DropButton } from './DropButton'
import { FileDrop } from './FileDrop'

const ICON_NAMES = {
  PASTE: 'capital-t',
  FILE: 'arrow-upward',
  IMAGE: 'image-frame'
}

export type OpenOptionsProps = {
  selectClipboard: () => void
  errorHandler: (err: string) => void
  fileLoadHandler: (files: File[]) => void
  imageLoadHandler: (files: File[]) => void
  isRecognizeDisabled: boolean
}

export const OpenOptions: FC<OpenOptionsProps> = ({
  selectClipboard,
  fileLoadHandler,
  imageLoadHandler,
  isRecognizeDisabled,
  errorHandler
}) => {
  return (
    <div className={styles.optionsContainer}>
      <div className={styles.dropContainer}>
        <DropButton
          clickHandler={selectClipboard}
          label="Paste from Clipboard"
        />
        <div className={styles.dropIconWrapper}>
          <Icon name={ICON_NAMES.PASTE} />
        </div>
      </div>

      <FileDrop
        onDropAccepted={fileLoadHandler}
        onDropRejected={(e) => errorHandler(`Unable to accept file(s). ${e}`)}
        buttonLabel="Open from file"
        textLabel="or drag file here"
        iconName={ICON_NAMES.FILE}
      />

      <FileDrop
        accept="image/*"
        disabled={isRecognizeDisabled}
        disabledText="Ketcher supports image recognition only in Remote mode"
        onDropAccepted={imageLoadHandler}
        onDropRejected={() =>
          errorHandler(
            'Unable to accept file(s). Make sure you upload 1 image.'
          )
        }
        buttonLabel="Open from image"
        textLabel="or drag file here"
        iconName={ICON_NAMES.IMAGE}
      />
    </div>
  )
}
