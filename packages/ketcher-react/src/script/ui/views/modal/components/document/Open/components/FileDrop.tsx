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

import { useMemo, useRef, useEffect } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';

import parentStyles from './OpenOptions.module.less';
import styles from './FileDrop.module.less';
import { Icon, IconName } from 'components';
import {
  getIfFullScreen,
  requestFullscreen,
} from '../../../../../../action/fullscreen';
import { getFullscreenElement } from '../../../../../../../../utils';

type FileDropProps = {
  buttonLabel: string;
  textLabel: string;
  iconName: IconName;
  disabled?: boolean;
  disabledText?: string;
  testId?: string;
} & DropzoneOptions;

const FileDrop = ({
  buttonLabel,
  textLabel,
  iconName,
  disabled,
  disabledText,
  testId,
  ...rest
}: FileDropProps) => {
  const wasFullscreenRef = useRef(false);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    multiple: false,
    disabled,
    ...rest,
  });

  // Custom open handler that preserves fullscreen state
  const handleOpenWithFullscreen = () => {
    // Store fullscreen state before opening file dialog
    wasFullscreenRef.current = getIfFullScreen();
    open();
  };

  // Listen for file input change to restore fullscreen
  useEffect(() => {
    const restoreFullscreen = () => {
      // Small delay to ensure file dialog is closed
      setTimeout(() => {
        if (wasFullscreenRef.current && !getIfFullScreen()) {
          const fullscreenElement = getFullscreenElement();
          requestFullscreen(fullscreenElement);
          wasFullscreenRef.current = false;
        }
      }, 100);
    };

    // Listen for focus events which indicate file dialog closed
    window.addEventListener('focus', restoreFullscreen);

    return () => {
      window.removeEventListener('focus', restoreFullscreen);
    };
  }, []);

  const getClassesString = useMemo((): string => {
    const classes = [
      parentStyles.dropContainer,
      isDragActive ? styles.isHovered : null,
      disabled ? styles.isDisabled : null,
    ];
    return classes.join(' ');
  }, [isDragActive]);

  return (
    <div
      data-testid={testId}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleOpenWithFullscreen();
        }
      }}
      {...getRootProps({
        className: getClassesString,
        onClick: (e) => {
          e.preventDefault();
          handleOpenWithFullscreen();
        },
      })}
    >
      <input {...getInputProps()} />
      <div className={parentStyles.dropIconWrapper}>
        <Icon name={iconName} />
      </div>
      {disabled ? (
        <p className={parentStyles.textLabel}>{disabledText}</p>
      ) : (
        <>
          <div className={parentStyles.textLabelWrapper}>
            <p className={parentStyles.textLabel}>{textLabel}</p>
          </div>
          <div className={parentStyles.buttonLabelWrapper}>
            <p className={parentStyles.buttonLabel}>{buttonLabel}</p>
          </div>
        </>
      )}
    </div>
  );
};

export { FileDrop };
