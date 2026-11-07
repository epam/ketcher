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

import type React from 'react';
import type { TextCommand } from 'ketcher-core';
import clsx from 'clsx';
import styles from './TextButton.module.less';
import { type IconName, Icon } from 'components';

interface TextButtonProperties {
  button: { command: TextCommand; name: IconName };
  active: boolean;
}

interface TextButtonPropertiesCallProperties {
  toggleStyle: (command: TextCommand) => void;
}

type Properties = TextButtonProperties & TextButtonPropertiesCallProperties;

export const TextButton = (properties: Properties) => {
  const toggleStyle = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    command: TextCommand,
  ) => {
    event.preventDefault();
    properties.toggleStyle(command);
  };

  return (
    <button
      className={clsx(styles.textButton, {
        [styles.isActive]: properties.active,
      })}
      title={properties.button.command.toLowerCase()}
      data-testid={properties.button.name}
      onMouseDown={(event) => {
        toggleStyle(event, properties.button.command);
      }}
    >
      <Icon name={properties.button.name} />
    </button>
  );
};
