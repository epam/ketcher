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
import React from 'react'
import { mediaSizes } from '../../mediaSizes'
import {
  ToolbarGroupItemCallProps,
  ToolbarGroupItemProps
} from '../../ToolbarGroupItem'
import { ToolbarMultiToolItem } from '../../ToolbarGroupItem/ToolbarMultiToolItem'
import {
  bondCommon,
  bondStereo,
  bondQuery,
  groupOptions,
  groupDescriptors
} from './options'

interface BondProps extends Omit<ToolbarGroupItemProps, 'id' | 'options'> {
  height?: number
}
interface BondCallProps extends ToolbarGroupItemCallProps {}

type Props = BondProps & BondCallProps

const Bond = (props: Props) => {
  const { height, ...rest } = props

  if (height && height <= mediaSizes.bondCollapsableHeight) {
    return (
      <ToolbarMultiToolItem
        id="bond-common"
        options={groupOptions}
        variant="grouped"
        groups={groupDescriptors}
        {...rest}
      />
    )
  }

  return (
    <>
      <ToolbarMultiToolItem id="bond-common" options={bondCommon} {...rest} />
      <ToolbarMultiToolItem id="bond-stereo" options={bondStereo} {...rest} />
      <ToolbarMultiToolItem id="bond-query" options={bondQuery} {...rest} />
    </>
  )
}

export type { BondProps, BondCallProps }
export { Bond }
