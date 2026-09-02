/* eslint-disable @typescript-eslint/no-explicit-any */
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

import { type FC, type PropsWithChildren } from 'react';
import {
  type ToolbarGroupItemCallProps,
  type ToolbarGroupItemProps,
  ToolbarGroupItem,
} from '../ToolbarGroupItem';

import { ArrowScroll } from '../ArrowScroll';
import { AtomsList } from './AtomsList';
import { basicAtoms } from '../../../action/atoms';
import classes from './RightToolbar.module.less';
import clsx from 'clsx';
import { useResizeObserver } from '../../../../../hooks';
import { HorizontalDivider } from '../TopToolbar/Divider';
import { useVerticalToolbarScroll } from '../useVerticalToolbarScroll';

const Group: FC<{ className?: string } & PropsWithChildren> = ({
  children,
  className,
}) => <div className={clsx(classes.group, className)}>{children}</div>;

interface RightToolbarProps extends Omit<
  ToolbarGroupItemProps,
  'id' | 'options'
> {
  className?: string;
  active?: {
    opts: any;
    tool: string;
  };
  freqAtoms: any[];
}

type RightToolbarCallProps = ToolbarGroupItemCallProps;

type Props = RightToolbarProps & RightToolbarCallProps;

const RightToolbar = (props: Props) => {
  const { className, ...rest } = props;
  const { active, onAction, freqAtoms, status } = rest;
  const { ref, height } = useResizeObserver<HTMLDivElement>();
  const {
    scrollContainerRef,
    scrollStepRef,
    startRef,
    endRef,
    startInView,
    endInView,
    isOverflowing,
    scrollBack,
    scrollForward,
  } = useVerticalToolbarScroll();

  return (
    <div
      data-testid="right-toolbar"
      className={clsx(classes.root, className)}
      ref={ref}
    >
      <div ref={scrollContainerRef} className={classes.buttons}>
        <div ref={startRef}>
          <Group
            className={clsx(
              classes.atomsList,
              classes.buttons,
              classes.groupItem,
            )}
          >
            <AtomsList
              atoms={basicAtoms.slice(0, 1)}
              active={active}
              onAction={onAction}
              status={status}
            />
            <AtomsList
              atoms={basicAtoms.slice(1, 5)}
              active={active}
              onAction={onAction}
              status={status}
            />
            <HorizontalDivider></HorizontalDivider>
            <AtomsList
              atoms={basicAtoms.slice(5)}
              active={active}
              onAction={onAction}
              status={status}
            />
            <AtomsList
              atoms={freqAtoms}
              status={status}
              active={active}
              onAction={onAction}
            />
            <ToolbarGroupItem id="period-table" {...rest} />
          </Group>
        </div>

        <div ref={endRef}>
          <Group className={classes.groupItem}>
            <div ref={scrollStepRef}>
              <ToolbarGroupItem id="any-atom" {...rest} />
              <div className={classes.button}>
                <ToolbarGroupItem id="extended-table" {...rest} />
              </div>
            </div>
          </Group>
        </div>
      </div>
      {height && isOverflowing && (
        <ArrowScroll
          startInView={startInView}
          endInView={endInView}
          scrollForward={scrollForward}
          scrollBack={scrollBack}
        />
      )}
    </div>
  );
};

export type { RightToolbarProps, RightToolbarCallProps };
export { RightToolbar };
