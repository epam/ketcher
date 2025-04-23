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
import { KetcherLogger, GenerateImageOptions } from 'ketcher-core';
import { saveAs } from 'file-saver';

import React, { PropsWithChildren } from 'react';
import { useAppContext } from '../../../../hooks';
import { fileSaver } from './saveButton.utils';
import { SaverType } from './saveButton.types';

type Props = {
  server?: any;
  filename: string;
  data: any;
  type?: string;
  mode?: string;
  options?: GenerateImageOptions;
  onSave?: () => void;
  onError?: (err: any) => void;
  className?: string;
  title?: string;
  disabled?: boolean;
  testId?: string;
};

type SaveButtonProps = PropsWithChildren<Props>;

const SaveButton = (props: SaveButtonProps) => {
  const noop = () => null;
  const {
    server,
    filename = 'unnamed',
    data,
    type,
    mode = 'saveFile',
    options,
    onSave = noop,
    onError = noop,
    className,
    title,
    disabled,
    testId,
  } = props;
  const { getKetcherInstance } = useAppContext();

  const saveFile = () => {
    if (data) {
      try {
        fileSaver(server).then((saver: SaverType) => {
          saver(data, filename, type);
          onSave();
        });
      } catch (e) {
        KetcherLogger.error('savebutton.tsx::SaveButton::saveFile', e);
        onError(e);
      }
    }
  };

  const saveImage = () => {
    const ketcherInstance = getKetcherInstance();
    if (options?.outputFormat) {
      ketcherInstance
        .generateImage(data, options)
        .then((blob) => {
          saveAs(blob, `${filename}.${options.outputFormat}`);
          onSave();
        })
        .catch((e) => {
          KetcherLogger.error('savebutton.tsx::SaveButton::saveImage', e);
          onError(e);
        });
    }
  };

  const save = (event: React.KeyboardEvent | React.MouseEvent) => {
    event.preventDefault();
    switch (mode) {
      case 'saveImage':
        saveImage();
        break;
      case 'saveFile':
      default:
        saveFile();
    }
  };

  return (
    <button
      title={title}
      className={className}
      disabled={disabled}
      data-testid={testId}
      onClick={(event) => {
        save(event);
      }}
    >
      {props.children}
    </button>
  );
};

export { SaveButton };
