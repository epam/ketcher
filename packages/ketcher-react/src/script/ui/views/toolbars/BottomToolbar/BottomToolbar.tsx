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
import { TemplatesList } from './TemplatesList'

import classes from './BottomToolbar.module.less'

interface BottomToolbarProps
  extends Omit<ToolbarGroupItemProps, 'id' | 'options' | 'Component' | 'tool'> {
  className?: string
}

interface BottomToolbarCallProps extends ToolbarGroupItemCallProps {}

type Props = BottomToolbarProps & BottomToolbarCallProps

const BottomToolbar = (props: Props) => {
  const { className, ...rest } = props
  return (
    <div className={clsx(classes.root, className)}>
      <div className={classes.group}>
        <ToolbarGroupItem
          id="template-common"
          Component={TemplatesList}
          {...rest}
        />
      </div>

      <div className={classes.group}>
        <ToolbarGroupItem id="template-lib" {...rest} />
        {/*
          //TODO: it should be enabled after starting work on enhanced stereo
          <ToolbarGroupItem id="enhanced-stereo" {...rest} />
        */}
      </div>
    </div>
  )
}

export type { BottomToolbarProps, BottomToolbarCallProps }
export { BottomToolbar }
