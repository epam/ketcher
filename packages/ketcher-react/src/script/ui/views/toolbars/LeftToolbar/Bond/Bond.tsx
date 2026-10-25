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

import type {
  ToolbarGroupItemCallProperties,
  ToolbarGroupItemProperties,
} from '../../ToolbarGroupItem';
import {
  bondCommon,
  bondQuery,
  bondSpecial,
  bondStereo,
  groupDescriptors,
  groupOptions,
} from './options';

import { ToolbarMultiToolItem } from '../../ToolbarGroupItem/ToolbarMultiToolItem';
import { mediaSizes } from '../../mediaSizes';

interface BondProperties extends Omit<
  ToolbarGroupItemProperties,
  'id' | 'options'
> {
  height?: number;
}
type BondCallProperties = ToolbarGroupItemCallProperties;

type Properties = BondProperties & BondCallProperties;

const Bond = (properties: Properties) => {
  const { height, ...rest } = properties;

  if (height && height <= mediaSizes.bondCollapsableHeight) {
    return (
      <ToolbarMultiToolItem
        id="bonds"
        options={groupOptions}
        variant="grouped"
        groups={groupDescriptors}
        {...rest}
      />
    );
  }

  return (
    <>
      <ToolbarMultiToolItem id="bond-common" options={bondCommon} {...rest} />
      <ToolbarMultiToolItem id="bond-stereo" options={bondStereo} {...rest} />
      <ToolbarMultiToolItem id="bond-query" options={bondQuery} {...rest} />
      <ToolbarMultiToolItem id="bond-special" options={bondSpecial} {...rest} />
    </>
  );
};

export type { BondProperties, BondCallProperties };
export { Bond };
