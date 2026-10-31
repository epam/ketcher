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

import type {
  MultiToolCallProperties,
  MultiToolProperties,
} from '../variants.types';

import {
  type ActionButtonProperties,
  ActionButton,
} from '../../../ActionButton';
import action from '../../../../../../action';
import { getIconName } from 'components';

type DefaultMultiToolProperties = MultiToolProperties;
type DefaultMultiToolCallProperties = MultiToolCallProperties;

type Properties = DefaultMultiToolProperties & DefaultMultiToolCallProperties;

const DefaultMultiTool = (properties: Properties) => {
  const { options, status, disableableButtons, indigoVerification, onAction } =
    properties;

  return (
    <>
      {options.map((toolbarItem) => {
        const currentStatus = status[toolbarItem.id];
        const iconName = getIconName(toolbarItem.id);
        return (
          iconName && (
            <ActionButton
              key={toolbarItem.id}
              name={iconName}
              action={action[toolbarItem.id]}
              status={currentStatus as ActionButtonProperties['status']}
              selected={!!currentStatus?.selected}
              disableableButtons={disableableButtons}
              indigoVerification={indigoVerification}
              onAction={onAction}
            />
          )
        );
      })}
    </>
  );
};

export type { DefaultMultiToolProperties, DefaultMultiToolCallProperties };
export { DefaultMultiTool };
