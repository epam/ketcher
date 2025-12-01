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

import { RefObject, useRef } from 'react';
import { CREATE_MONOMER_TOOL_NAME, IMAGE_KEY } from 'ketcher-core';
import {
  ToolbarGroupItem,
  ToolbarGroupItemCallProps,
  ToolbarGroupItemProps,
} from '../ToolbarGroupItem';
import { ToolbarItem, ToolbarItemVariant } from '../toolbar.types';
import {
  arrowsOptions,
  bondCommon,
  bondQuery,
  bondSpecial,
  bondStereo,
  mappingOptions,
  rGroupOptions,
  selectOptions,
  shapeOptions,
} from './leftToolbarOptions';

import { ArrowScroll } from '../ArrowScroll';
import { Bond } from './Bond';
import { RGroup } from './RGroup';
import { Shape } from './Shape';
import { Tools } from '../../../action';
import classes from './LeftToolbar.module.less';
import clsx from 'clsx';
import { useInView } from 'react-intersection-observer';
import { useResizeObserver } from '../../../../../hooks';

interface LeftToolbarProps
  extends Omit<ToolbarGroupItemProps, 'id' | 'options'> {
  className?: string;
}

type LeftToolbarCallProps = ToolbarGroupItemCallProps;

type Props = LeftToolbarProps & LeftToolbarCallProps;

type ItemProps = {
  id: ToolbarItemVariant;
  options?: ToolbarItem[];
  dataTestId?: string;
};

interface GroupProps {
  items?: ItemProps[];
  className?: string;
  status: Tools;
  height?: number;
  rest: Omit<Props, 'className'>;
}

const Group = ({ items, className, status, height, rest }: GroupProps) => {
  const visibleItems: ItemProps[] = [];
  if (items) {
    items.forEach((item) => {
      let visible = true;
      if (
        status[item.id]?.hidden ||
        item.options?.every((option) => status[option.id]?.hidden)
      ) {
        visible = false;
      }
      if (visible) visibleItems.push(item);
    });
  }

  return visibleItems.length ? (
    <div className={clsx(classes.group, className)}>
      {visibleItems.map((item) => {
        switch (item.id) {
          case 'bond-common':
            return <Bond {...rest} height={height} key={item.id} />;
          case 'rgroup':
            return <RGroup {...rest} key={item.id} />;
          case 'shapes':
            return <Shape {...rest} key={item.id} />;
          case 'bonds':
            return (
              <ToolbarGroupItem
                id={item.id}
                options={item.options}
                key={item.id}
                dataTestId="bonds"
                {...rest}
              />
            );
          default:
            return (
              <ToolbarGroupItem
                id={item.id}
                options={item.options}
                key={item.id}
                {...rest}
              />
            );
        }
      })}
    </div>
  ) : null;
};

const LeftToolbar = (props: Props) => {
  const { className, ...rest } = props;
  const { ref, height } = useResizeObserver<HTMLDivElement>();
  const scrollRef = useRef(null) as RefObject<HTMLDivElement | null>;
  const [startRef, startInView] = useInView({ threshold: 1 });
  const [endRef, endInView] = useInView({ threshold: 1 });
  const sizeRef = useRef(null) as RefObject<HTMLDivElement | null>;

  const scrollUp = () => {
    if (!scrollRef.current || !sizeRef.current) {
      return;
    }

    scrollRef.current.scrollTop -= sizeRef.current.offsetHeight;
  };

  const scrollDown = () => {
    if (!scrollRef.current || !sizeRef.current) {
      return;
    }

    scrollRef.current.scrollTop += sizeRef.current.offsetHeight;
  };

  const status = rest.status;

  return (
    <div
      data-testid="left-toolbar"
      className={clsx(classes.root, className)}
      ref={ref}
    >
      <div
        className={classes.buttons}
        ref={scrollRef}
        data-testid="left-toolbar-buttons"
      >
        <div className={classes.listener} ref={startRef}>
          <Group
            className={classes.groupItem}
            items={[
              { id: 'hand' },
              { id: 'select', options: selectOptions },
              { id: 'erase' },
            ]}
            status={status}
            height={height}
            rest={rest}
          />
        </div>

        <Group
          className={classes.groupItem}
          items={[
            {
              id: 'bonds',
              options: [
                ...bondCommon,
                ...bondQuery,
                ...bondSpecial,
                ...bondStereo,
              ],
            },
            { id: 'chain' },
            { id: 'enhanced-stereo' },
            { id: 'charge-plus' },
            { id: 'charge-minus' },
          ]}
          status={status}
          height={height}
          rest={rest}
        />
        <div className={classes.listener} ref={sizeRef}>
          <Group
            className={classes.groupItem}
            items={[
              { id: 'sgroup' },
              { id: 'rgroup', options: rGroupOptions },
              { id: CREATE_MONOMER_TOOL_NAME },
            ]}
            status={status}
            height={height}
            rest={rest}
          />
        </div>

        <Group
          className={classes.groupItem}
          items={[
            { id: 'reaction-plus' },
            { id: 'arrows', options: arrowsOptions },
            {
              id: 'reaction-mapping-tools',
              options: mappingOptions,
            },
          ]}
          status={status}
          height={height}
          rest={rest}
        />

        <div ref={endRef}>
          <Group
            className={classes.groupItem}
            items={[
              { id: 'shapes', options: shapeOptions },
              { id: 'text' },
              { id: IMAGE_KEY },
            ]}
            status={status}
            height={height}
            rest={rest}
          />
        </div>
      </div>
      {height && (scrollRef?.current?.scrollHeight || 0) > height && (
        <ArrowScroll
          startInView={startInView}
          endInView={endInView}
          scrollForward={scrollDown}
          scrollBack={scrollUp}
        />
      )}
    </div>
  );
};

export type { LeftToolbarProps, LeftToolbarCallProps };
export { LeftToolbar };
