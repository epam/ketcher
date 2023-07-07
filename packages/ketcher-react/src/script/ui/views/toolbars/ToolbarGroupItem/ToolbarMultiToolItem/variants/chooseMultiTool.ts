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

import {
  DefaultMultiTool,
  classes as defaultClasses,
} from './DefaultMultiTool';
import {
  MultiToolCallProps,
  MultiToolProps,
  MultiToolVariant,
} from './variants.types';

import { ComponentType } from 'react';
import { GroupedMultiTool } from './GroupedMultiTool';

export function chooseMultiTool(
  variant: MultiToolVariant = 'default',
): [ComponentType<MultiToolProps & MultiToolCallProps>, string?] {
  switch (variant) {
    case 'default':
      return [DefaultMultiTool, defaultClasses.default];

    case 'grouped':
      return [GroupedMultiTool];

    default:
      throw new Error(`Unsupported variant ${variant}`);
  }
}
