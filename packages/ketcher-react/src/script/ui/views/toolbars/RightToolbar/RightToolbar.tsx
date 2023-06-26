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

import { FC, MutableRefObject, PropsWithChildren, useRef } from 'react'
import {
  ToolbarGroupItem,
  ToolbarGroupItemCallProps,
  ToolbarGroupItemProps
} from '../ToolbarGroupItem'

import { ArrowScroll } from '../ArrowScroll'
import { AtomsList } from './AtomsList'
import { basicAtoms } from '../../../action/atoms'
import classes from './RightToolbar.module.less'
import clsx from 'clsx'
import { useInView } from 'react-intersection-observer'
import { useResizeObserver } from '../../../../../hooks'
import { HorizontalDivider } from '../TopToolbar/Divider'

const Group: FC<{ className?: string } & PropsWithChildren> = ({
  children,
  className
}) => <div className={clsx(classes.group, className)}>{children}</div>

interface RightToolbarProps
  extends Omit<ToolbarGroupItemProps, 'id' | 'options'> {
  className?: string
  active?: {
    opts: any
    tool: string
  }
  freqAtoms: any[]
}

type RightToolbarCallProps = ToolbarGroupItemCallProps

type Props = RightToolbarProps & RightToolbarCallProps

const RightToolbar = (props: Props) => {
  const { className, ...rest } = props
  const { active, onAction, freqAtoms } = rest
  const { ref, height } = useResizeObserver<HTMLDivElement>()
  const [startRef, startInView] = useInView({ threshold: 1 })
  const [endRef, endInView] = useInView({ threshold: 1 })
  const sizeRef = useRef() as MutableRefObject<HTMLDivElement>
  const scrollRef = useRef() as MutableRefObject<HTMLDivElement>

  const scrollUp = () => {
    scrollRef.current.scrollTop -= sizeRef.current.offsetHeight
  }

  const scrollDown = () => {
    scrollRef.current.scrollTop += sizeRef.current.offsetHeight
  }

  return (
    <div className={clsx(classes.root, className)} ref={ref}>
      <div ref={scrollRef}>
        <Group
          className={clsx(
            classes.atomsList,
            classes.buttons,
            classes.groupItem
          )}
        >
          <ToolbarGroupItem id="period-table" {...rest} />
          <AtomsList
            ref={startRef}
            atoms={basicAtoms.slice(0, 1)}
            active={active}
            onAction={onAction}
          />
          <AtomsList
            atoms={basicAtoms.slice(1, 5)}
            active={active}
            onAction={onAction}
          />
          <HorizontalDivider></HorizontalDivider>
          <AtomsList
            atoms={basicAtoms.slice(5)}
            active={active}
            onAction={onAction}
          />
          <AtomsList atoms={freqAtoms} active={active} onAction={onAction} />
        </Group>

        <Group className={clsx(classes.buttons, classes.groupItem)}>
          <div ref={sizeRef}>
            <div ref={endRef} className={classes.button}>
              <ToolbarGroupItem id="extended-table" {...rest} />
            </div>
            <ToolbarGroupItem id="any-atom" {...rest} />
          </div>
        </Group>
      </div>
      {height && scrollRef?.current?.scrollHeight > height && (
        <ArrowScroll
          startInView={startInView}
          endInView={endInView}
          scrollUp={scrollUp}
          scrollDown={scrollDown}
        />
      )}
    </div>
  )
}

export type { RightToolbarProps, RightToolbarCallProps }
export { RightToolbar }
