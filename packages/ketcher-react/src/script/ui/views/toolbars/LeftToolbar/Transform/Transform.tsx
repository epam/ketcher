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
import { useMediaQuery } from 'react-responsive'
import {
  ToolbarGroupItem,
  ToolbarGroupItemCallProps,
  ToolbarGroupItemProps
} from '../../ToolbarGroupItem'

interface TransformProps
  extends Omit<ToolbarGroupItemProps, 'id' | 'options'> {}

interface TransformCallProps extends ToolbarGroupItemCallProps {}

type Props = TransformProps & TransformCallProps

const Transform = (props: Props) => {
  const collapseTransform = useMediaQuery({ query: '(max-height: 800px)' })

  if (collapseTransform) {
    return (
      <ToolbarGroupItem
        id="transform-rotate"
        options={[
          {
            id: 'transform-rotate'
          },
          {
            id: 'transform-flip-h'
          },
          {
            id: 'transform-flip-v'
          }
        ]}
        {...props}
      />
    )
  }

  return (
    <>
      <ToolbarGroupItem id="transform-rotate" {...props} />
      <ToolbarGroupItem id="transform-flip-h" {...props} />
      <ToolbarGroupItem id="transform-flip-v" {...props} />
    </>
  )
}

export type { TransformProps, TransformCallProps }
export { Transform }
