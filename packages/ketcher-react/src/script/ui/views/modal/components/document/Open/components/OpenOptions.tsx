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

import { FC } from 'react';

import styles from './OpenOptions.module.less';
import { FileDrop } from './FileDrop';
import { Icon } from 'components';

const ICON_NAMES = {
  PASTE: 'open-window-paste-icon',
  FILE: 'open-window-upload-icon',
  IMAGE: 'image-frame',
} as const;

export type OpenOptionsProps = {
  selectClipboard: () => void;
  errorHandler: (err: string) => void;
  fileLoadHandler: (files: File[]) => void;
  imageLoadHandler: (files: File[]) => void;
  isRecognizeDisabled: boolean;
};

export const OpenOptions: FC<OpenOptionsProps> = ({
  selectClipboard,
  fileLoadHandler,
  imageLoadHandler,
  isRecognizeDisabled,
  errorHandler,
}) => {
  return (
    <div className={styles.optionsContainer}>
      <div onClick={selectClipboard} className={styles.dropContainer}>
        <div className={styles.dropIconWrapper}>
          <Icon name={ICON_NAMES.PASTE} />
        </div>
        <div className={styles.textLabelWrapper}>
          {/* <p className={styles.textLabel}>or press Ctrl + V</p> */}
        </div>
        <div className={styles.buttonLabelWrapper}>
          <p className={styles.buttonLabel}>Paste from clipboard</p>
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
        disabledText="Image Recognition service is not available"
        onDropAccepted={imageLoadHandler}
        onDropRejected={() =>
          errorHandler(
            'Unable to accept file(s). Make sure you upload 1 image.',
          )
        }
        buttonLabel="Open from image"
        textLabel="or drag file here"
        iconName={ICON_NAMES.IMAGE}
      />
    </div>
  );
};
