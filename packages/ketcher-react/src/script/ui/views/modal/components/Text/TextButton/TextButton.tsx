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

import React from 'react';
import { TextCommand } from 'ketcher-core';
import clsx from 'clsx';
import styles from './TextButton.module.less';
import { Icon, IconName } from 'components';

interface TextButtonProps {
  button: { command: TextCommand; name: IconName };
  active: boolean;
}

interface TextButtonPropsCallProps {
  toggleStyle: (command: TextCommand) => void;
}

type Props = TextButtonProps & TextButtonPropsCallProps;

export const TextButton = (props: Props) => {
  const toggleStyle = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    command: TextCommand,
  ) => {
    event.preventDefault();
    props.toggleStyle(command);
  };

  return (
    <button
      className={clsx(styles.textButton, { [styles.isActive]: props.active })}
      title={props.button.command.toLowerCase()}
      onMouseDown={(event) => {
        toggleStyle(event, props.button.command);
      }}
    >
      <Icon name={props.button.name} />
    </button>
  );
};
