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
import { ZoomList } from './ZoomList'

import styles from './TopToolbar.module.less'

interface TopToolbarProps
  extends Omit<ToolbarGroupItemProps, 'id' | 'options' | 'Component' | 'tool'> {
  className?: string
}

interface TopToolbarCallProps extends ToolbarGroupItemCallProps {}

type Props = TopToolbarProps & TopToolbarCallProps

const TopToolbar = (props: Props) => {
  const { className, ...rest } = props
  return (
    <div className={clsx(styles.root, className)}>
      <div className={styles.group}>
        <ToolbarGroupItem id="new" {...rest} />
        <ToolbarGroupItem id="open" {...rest} />
        <ToolbarGroupItem id="save" {...rest} />
      </div>

      <div className={styles.group}>
        <ToolbarGroupItem id="undo" {...rest} />
        <ToolbarGroupItem id="redo" {...rest} />
        <ToolbarGroupItem id="cut" {...rest} />
        <ToolbarGroupItem id="copy" {...rest} />
        <ToolbarGroupItem id="paste" {...rest} />
      </div>

      <div className={clsx(styles.group, 'zoom')}>
        <ToolbarGroupItem id="zoom-in" {...rest} />
        <ToolbarGroupItem id="zoom-out" {...rest} />
        <ToolbarGroupItem id="zoom-list" Component={ZoomList} {...rest} />
      </div>

      <div className={styles.group}>
        <ToolbarGroupItem id="layout" {...rest} />
        <ToolbarGroupItem id="clean" {...rest} />
        <ToolbarGroupItem id="arom" {...rest} />
        <ToolbarGroupItem id="dearom" {...rest} />
        <ToolbarGroupItem id="cip" {...rest} />
        <ToolbarGroupItem id="check" {...rest} />
      </div>

      <div className={styles.group}>
        <ToolbarGroupItem id="recognize" {...rest} />
        <ToolbarGroupItem id="miew" {...rest} />
      </div>

      <div className={clsx(styles.group, 'meta')}>
        <ToolbarGroupItem id="settings" {...rest} />
        <ToolbarGroupItem id="help" {...rest} />
        <ToolbarGroupItem id="about" {...rest} />
      </div>
    </div>
  )
}

export type { TopToolbarProps, TopToolbarCallProps }
export { TopToolbar }
