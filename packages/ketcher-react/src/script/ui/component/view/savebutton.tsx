/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
import {
  type GenerateImageOptions,
  type StructService,
  KetcherLogger,
  ketcherProvider,
} from 'ketcher-core';
import { saveAs } from 'file-saver';

import type { KeyboardEvent, MouseEvent, PropsWithChildren } from 'react';
import { useAppContext } from '../../../../hooks';
import { fileSaver } from './saveButton.utilities';
import type { SaverType } from './saveButton.types';

type Properties = {
  server?: StructService | null;
  filename: string;
  data?: Blob | string;
  getData?: () => Blob | string;
  type?: string;
  mode?: string;
  options?: GenerateImageOptions;
  onSave?: () => void;
  onError?: (error: unknown) => void;
  className?: string;
  title?: string;
  disabled?: boolean;
  testId?: string;
};

type SaveButtonProperties = PropsWithChildren<Properties>;

const SaveButton = (properties: SaveButtonProperties) => {
  const noop = () => null;
  const {
    server,
    filename = 'unnamed',
    data,
    getData,
    type,
    mode = 'saveFile',
    options,
    onSave = noop,
    onError = noop,
    className,
    title,
    disabled,
    testId,
  } = properties;
  const { ketcherId } = useAppContext();

  const saveFile = async () => {
    try {
      const dataToSave = getData ? getData() : data;
      if (dataToSave) {
        const saver: SaverType = await fileSaver(server);
        saver(dataToSave, filename, type);
        onSave();
      }
    } catch (error) {
      KetcherLogger.error('savebutton.tsx::SaveButton::saveFile', error);
      onError(error);
    }
  };

  const saveImage = () => {
    const ketcherInstance = ketcherProvider.getKetcher(ketcherId);
    if (typeof data === 'string' && options?.outputFormat) {
      ketcherInstance
        .generateImage(data, options)
        .then((blob) => {
          saveAs(blob, `${filename}.${options.outputFormat}`);
          onSave();
        })
        .catch((error) => {
          KetcherLogger.error('savebutton.tsx::SaveButton::saveImage', error);
          onError(error);
        });
    }
  };

  const save = (event: KeyboardEvent | MouseEvent) => {
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
      {properties.children}
    </button>
  );
};

export { SaveButton };
