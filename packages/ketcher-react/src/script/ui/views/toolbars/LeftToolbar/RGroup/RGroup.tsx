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
  ToolbarGroupItem,
  ToolbarGroupItemCallProps,
  ToolbarGroupItemProps
} from '../../ToolbarGroupItem'
import { makeItems } from '../../ToolbarGroupItem/utils'

const rGroupOptions = makeItems([
  'rgroup-label',
  'rgroup-fragment',
  'rgroup-attpoints'
])

interface RGroupProps extends Omit<ToolbarGroupItemProps, 'id' | 'options'> {
  height?: number
}
interface RGroupCallProps extends ToolbarGroupItemCallProps {}

type Props = RGroupProps & RGroupCallProps

const RGroup = (props: Props) => {
  const { height, ...rest } = props

  if (height && height <= mediaSizes.rGroupCollapsableHeight) {
    return (
      <ToolbarGroupItem id="rgroup-label" options={rGroupOptions} {...rest} />
    )
  }

  return (
    <>
      <ToolbarGroupItem id="rgroup-label" {...rest} />
      <ToolbarGroupItem id="rgroup-fragment" {...rest} />
      <ToolbarGroupItem id="rgroup-attpoints" {...rest} />
    </>
  )
}

export type { RGroupProps, RGroupCallProps }
export { RGroup }
