/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { CREATE_MONOMER_TOOL_NAME, IMAGE_KEY } from 'ketcher-core';
import {
  type ToolbarGroupItemCallProperties,
  type ToolbarGroupItemProperties,
  ToolbarGroupItem,
} from '../ToolbarGroupItem';
import type { ToolbarItem, ToolbarItemVariant } from '../toolbar.types';
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
import { useResizeObserver } from '../../../../../hooks';
import { useVerticalToolbarScroll } from '../useVerticalToolbarScroll';

interface LeftToolbarProperties extends Omit<
  ToolbarGroupItemProperties,
  'id' | 'options'
> {
  className?: string;
}

type LeftToolbarCallProperties = ToolbarGroupItemCallProperties;

type Properties = LeftToolbarProperties & LeftToolbarCallProperties;

type ItemProperties = {
  id: ToolbarItemVariant;
  options?: ToolbarItem[];
  dataTestId?: string;
};

interface GroupProperties {
  items?: ItemProperties[];
  className?: string;
  height?: number;
  rest: Omit<Properties, 'className'>;
}

const Group = ({ items, className, height, rest }: GroupProperties) => {
  const { status } = rest;
  const visibleItems =
    items?.reduce<ItemProperties[]>(
      (accumulator, item) =>
        status[item.id]?.hidden ||
        item.options?.every((option) => status[option.id]?.hidden)
          ? accumulator
          : [...accumulator, item],
      [],
    ) ?? [];

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

const LeftToolbar = (properties: Properties) => {
  const { className, ...rest } = properties;
  const { ref, height } = useResizeObserver<HTMLDivElement>();
  const {
    scrollContainerRef,
    scrollStepReference,
    startReference,
    endReference,
    startInView,
    endInView,
    isOverflowing,
    scrollBack,
    scrollForward,
  } = useVerticalToolbarScroll();

  return (
    <div
      data-testid="left-toolbar"
      className={clsx(classes.root, className)}
      ref={ref}
    >
      <div
        className={classes.buttons}
        ref={scrollContainerRef}
        data-testid="left-toolbar-buttons"
      >
        <div className={classes.listener} ref={startReference}>
          <Group
            className={classes.groupItem}
            items={[
              { id: 'hand' },
              { id: 'select', options: selectOptions },
              { id: 'erase' },
            ]}
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
          height={height}
          rest={rest}
        />
        <div className={classes.listener} ref={scrollStepReference}>
          <Group
            className={classes.groupItem}
            items={[
              { id: 'sgroup' },
              { id: 'rgroup', options: rGroupOptions },
              { id: CREATE_MONOMER_TOOL_NAME },
            ]}
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
          height={height}
          rest={rest}
        />

        <div ref={endReference}>
          <Group
            className={classes.groupItem}
            items={[
              { id: 'shapes', options: shapeOptions },
              { id: 'text' },
              { id: IMAGE_KEY },
            ]}
            height={height}
            rest={rest}
          />
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

export type { LeftToolbarProperties, LeftToolbarCallProperties };
export { LeftToolbar };
