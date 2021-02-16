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
import React, { FC } from 'react'

import { useResizeObserver } from '../../../../../hooks'
import { mediaSizes } from '../mediaSizes'
import {
  ToolbarGroupItem,
  ToolbarGroupItemCallProps,
  ToolbarGroupItemProps
} from '../ToolbarGroupItem'
import { ToolbarItem, ToolbarItemVariant } from '../toolbar.types'
import classes from './TopToolbar.module.less'
import { ZoomList } from './ZoomList'

const Group: FC<{ className?: string }> = ({ children, className }) => (
  <div className={clsx(classes.group, className)}>{children}</div>
)

interface TopToolbarProps
  extends Omit<ToolbarGroupItemProps, 'id' | 'options'> {
  className?: string
}

interface TopToolbarCallProps extends ToolbarGroupItemCallProps {}

type Props = TopToolbarProps & TopToolbarCallProps

const TopToolbar = (props: Props) => {
  const { className, ...rest } = props
  const { ref, width } = useResizeObserver<HTMLDivElement>()

  type ItemProps = {
    id: ToolbarItemVariant
    options?: ToolbarItem[]
    className?: string
  }
  const Item = ({ id, options, className }: ItemProps) =>
    ToolbarGroupItem({ id, options, className, ...rest })

  return (
    <div
      ref={ref}
      className={clsx(classes.root, className, {
        [classes.hideSeparators]:
          width && width < mediaSizes.topSeparatorsShowingWidth
      })}>
      <Group>
        <Item id="new" />
        <Item id="open" />
        <Item id="save" />
      </Group>

      <Group>
        <Item id="undo" />
        <Item id="redo" />
        <Item id="cut" />
        <Item id="copy" />
        <Item id="paste" />
      </Group>

      <Group>
        {width && width >= mediaSizes.zoomShowingWidth ? (
          <>
            <Item id="zoom-in" />
            <Item id="zoom-out" />
          </>
        ) : null}
        <ZoomList status={rest.status} onAction={rest.onAction} />
      </Group>

      <Group>
        <Item id="layout" />
        <Item id="clean" />
        <Item id="arom" />
        <Item id="dearom" />
        <Item id="cip" />
        <Item id="check" />
        <Item id="analyse" />
      </Group>

      <Group className={classes.recognize}>
        <Item id="recognize" />
        <Item id="miew" />
      </Group>

      <Group className={classes.meta}>
        <Item id="settings" />
        {width && width >= mediaSizes.infoShowingWidth ? (
          <>
            <Item id="help" />
            <Item id="about" />
          </>
        ) : null}
      </Group>
    </div>
  )
}

export type { TopToolbarProps, TopToolbarCallProps }
export { TopToolbar }
