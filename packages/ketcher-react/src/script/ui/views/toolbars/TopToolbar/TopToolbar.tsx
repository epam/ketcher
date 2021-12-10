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

import { FC } from 'react'
import {
  ToolbarGroupItem,
  ToolbarGroupItemCallProps,
  ToolbarGroupItemProps
} from '../ToolbarGroupItem'
import { ToolbarItem, ToolbarItemVariant } from '../toolbar.types'

import { ZoomList } from './ZoomList'
import classes from './TopToolbar.module.less'
import clsx from 'clsx'
import { makeItems } from '../ToolbarGroupItem/utils'
import { mediaSizes } from '../mediaSizes'
import { useResizeObserver } from '../../../../../hooks'
import { HelpLink } from './HelpLink/HelpLink'

const Group: FC<{ className?: string }> = ({ children, className }) => (
  <div className={clsx(classes.group, className)}>{children}</div>
)

const copyOptions: ToolbarItem[] = makeItems([
  'copy',
  'copy-mol',
  'copy-ket',
  'copy-image'
])

interface TopToolbarProps
  extends Omit<ToolbarGroupItemProps, 'id' | 'options'> {
  className?: string
}

type TopToolbarCallProps = ToolbarGroupItemCallProps

type Props = TopToolbarProps & TopToolbarCallProps

const TopToolbar = (props: Props) => {
  const { className, status, ...rest } = props
  const { ref, width } = useResizeObserver<HTMLDivElement>()
  const isZoomListHidden = !status['zoom-list']?.hidden

  type ItemProps = {
    id: ToolbarItemVariant
    options?: ToolbarItem[]
    className?: string
    vertical?: boolean
  }
  const Item = ({ id, options, className, vertical }: ItemProps) =>
    ToolbarGroupItem({ id, options, className, vertical, status, ...rest })

  return (
    <div
      ref={ref}
      className={clsx(classes.root, className, {
        [classes.hideSeparators]:
          width && width < mediaSizes.topSeparatorsShowingWidth
      })}
    >
      <Group>
        <Item id="clear" />
        <Item id="open" />
        <Item id="save" />
      </Group>

      <Group>
        <Item id="undo" />
        <Item id="redo" />
        <Item id="cut" />
        <Item id="copies" options={copyOptions} vertical={true} />
        <Item id="paste" />
      </Group>

      <Group>
        {width && width >= mediaSizes.zoomShowingWidth ? (
          <>
            <Item id="zoom-in" />
            <Item id="zoom-out" />
          </>
        ) : null}
        {isZoomListHidden && (
          <ZoomList status={status} onAction={rest.onAction} />
        )}
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
            <HelpLink status={status.help} />
            <Item id="about" />
          </>
        ) : null}
      </Group>
    </div>
  )
}

export type { TopToolbarProps, TopToolbarCallProps }
export { TopToolbar }
