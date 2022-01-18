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
  ToolbarGroupItem,
  ToolbarGroupItemCallProps,
  ToolbarGroupItemProps
} from '../../ToolbarGroupItem'

import { transformOptions } from '../leftToolbarOptions'
import { mediaSizes } from '../../mediaSizes'

interface TransformProps extends Omit<ToolbarGroupItemProps, 'id' | 'options'> {
  height?: number
}
type TransformCallProps = ToolbarGroupItemCallProps

type Props = TransformProps & TransformCallProps

const Transform = (props: Props) => {
  const { height, ...rest } = props

  if (height && height <= mediaSizes.transformCollapsableHeight) {
    return (
      <ToolbarGroupItem id="transforms" options={transformOptions} {...rest} />
    )
  }

  return (
    <>
      <ToolbarGroupItem id="transform-rotate" {...rest} />
      <ToolbarGroupItem id="transform-flip-h" {...rest} />
      <ToolbarGroupItem id="transform-flip-v" {...rest} />
    </>
  )
}

export type { TransformProps, TransformCallProps }
export { Transform }
