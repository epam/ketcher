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
import clsx from 'clsx'
import React from 'react'

import {
  ToolbarGroupItem,
  ToolbarGroupItemCallProps,
  ToolbarGroupItemProps
} from '../ToolbarGroupItem'
import { Bond } from './Bond'

import classes from './LeftToolbar.module.less'
import { RGroup } from './RGroup'
import { Transform } from './Transform'

interface LeftToolbarProps
  extends Omit<ToolbarGroupItemProps, 'id' | 'options'> {
  className?: string
  isStandalone: boolean
}

interface LeftToolbarCallProps extends ToolbarGroupItemCallProps {}

type Props = LeftToolbarProps & LeftToolbarCallProps

const LeftToolbar = (props: Props) => {
  const { isStandalone, className, ...rest } = props

  return (
    <div className={clsx(classes.root, className)}>
      <div className={classes.group}>
        <ToolbarGroupItem
          id="select"
          options={[
            {
              id: 'select-lasso'
            },
            {
              id: 'select-rectangle'
            },
            {
              id: 'select-fragment'
            }
          ]}
          {...rest}
        />
        <ToolbarGroupItem id="erase" {...rest} />
      </div>

      <div className={classes.group}>
        <Bond {...rest} />
        <ToolbarGroupItem id="chain" {...rest} />
      </div>

      <div className={classes.group}>
        <ToolbarGroupItem id="charge-plus" {...rest} />
        <ToolbarGroupItem id="charge-minus" {...rest} />
      </div>

      <div className={classes.group}>
        <Transform {...rest} />
      </div>

      <div className={classes.group}>
        <ToolbarGroupItem id="sgroup" {...rest} />
        <ToolbarGroupItem id="sgroup-data" {...rest} />
        <ToolbarGroupItem
          id="reaction"
          options={[
            {
              id: 'reaction-arrow'
            },
            {
              id: 'reaction-plus'
            },
            {
              id: 'reaction-automap'
            },
            {
              id: 'reaction-map'
            },
            {
              id: 'reaction-unmap'
            }
          ]}
          {...rest}
        />
      </div>

      <div className={clsx(classes.group, classes.rGroup)}>
        <RGroup {...rest} />
      </div>

      {isStandalone ? null : (
        <div className={classes.group}>
          <ToolbarGroupItem id="shape-circle" {...rest} />
          <ToolbarGroupItem id="shape-rectangle" {...rest} />
          <ToolbarGroupItem id="shape-line" {...rest} />
        </div>
      )}
    </div>
  )
}

export type { LeftToolbarProps, LeftToolbarCallProps }
export { LeftToolbar }
