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

import { FC, MutableRefObject, useRef } from 'react';
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

const LeftToolbar = (props: Props) => {
  const { className, ...rest } = props;
  const { ref, height } = useResizeObserver<HTMLDivElement>();
  const scrollRef = useRef() as MutableRefObject<HTMLDivElement>;
  const [startRef, startInView] = useInView({ threshold: 1 });
  const [endRef, endInView] = useInView({ threshold: 1 });
  const sizeRef = useRef() as MutableRefObject<HTMLDivElement>;

  type ItemProps = {
    id: ToolbarItemVariant;
    options?: ToolbarItem[];
  };
  const Item = ({ id, options }: ItemProps) =>
    ToolbarGroupItem({ id, options, ...rest });

  const scrollUp = () => {
    scrollRef.current.scrollTop -= sizeRef.current.offsetHeight;
  };

  const scrollDown = () => {
    scrollRef.current.scrollTop += sizeRef.current.offsetHeight;
  };

  const status = rest.status;

  type GroupItem = ItemProps;

  const Group: FC<{ items?: GroupItem[]; className?: string }> = ({
    items,
    className,
  }) => {
    const visibleItems: GroupItem[] = [];
    if (items) {
      items.forEach((item) => {
        let visible = true;
        if (status[item.id]?.hidden) {
          visible = false;
        } else if (item.options?.every((option) => status[option.id]?.hidden)) {
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
            default:
              return <Item id={item.id} options={item.options} key={item.id} />;
          }
        })}
      </div>
    ) : null;
  };

  return (
    <div className={clsx(classes.root, className)} ref={ref}>
      <div className={classes.buttons} ref={scrollRef}>
        <div className={classes.listener} ref={startRef}>
          <Group
            className={classes.groupItem}
            items={[
              { id: 'hand' },
              { id: 'select', options: selectOptions },
              { id: 'erase' },
            ]}
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
        />
        <div className={classes.listener} ref={sizeRef}>
          <Group
            className={classes.groupItem}
            items={[{ id: 'sgroup' }, { id: 'rgroup', options: rGroupOptions }]}
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
        />

        <div ref={endRef}>
          <Group
            className={classes.groupItem}
            items={[{ id: 'shapes', options: shapeOptions }, { id: 'text' }]}
          />
        </div>
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
  );
};

export type { LeftToolbarProps, LeftToolbarCallProps };
export { LeftToolbar };
