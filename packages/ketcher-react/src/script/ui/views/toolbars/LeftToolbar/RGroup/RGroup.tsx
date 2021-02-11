import React from 'react'
import { useMediaQuery } from 'react-responsive'
import {
  ToolbarGroupItem,
  ToolbarGroupItemCallProps,
  ToolbarGroupItemProps
} from '../../ToolbarGroupItem'

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

interface RGroupProps extends Omit<ToolbarGroupItemProps, 'id' | 'options'> {}

interface RGroupCallProps extends ToolbarGroupItemCallProps {}

type Props = RGroupProps & RGroupCallProps

const RGroup = (props: Props) => {
  const collapseRGroup = useMediaQuery({ query: '(max-height: 850px)' })

  if (collapseRGroup) {
    return (
      <ToolbarGroupItem
        id="rgroup-label"
        options={[
          {
            id: 'rgroup-label'
          },
          {
            id: 'rgroup-fragment'
          },
          {
            id: 'rgroup-attpoints'
          }
        ]}
        {...props}
      />
    )
  }

  return (
    <>
      <ToolbarGroupItem id="rgroup-label" {...props} />
      <ToolbarGroupItem id="rgroup-fragment" {...props} />
      <ToolbarGroupItem id="rgroup-attpoints" {...props} />
    </>
  )
}

export type { RGroupProps, RGroupCallProps }
export { RGroup }
