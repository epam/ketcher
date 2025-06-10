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

import { EmptyFunction } from 'helpers';
import { Card } from './styles';
import { IRNAPresetItemProps } from './types';
import { memo, MouseEvent, useCallback, useEffect, useRef } from 'react';
import { StyledIcon } from 'components/monomerLibrary/RnaBuilder/RnaElementsView/Summary/styles';
import { useAppDispatch, useLayoutMode } from 'hooks';
import { togglePresetFavorites } from 'state/rna-builder';
import { getPresetUniqueKey } from 'state/library';
import { FavoriteStarSymbol } from '../../../constants';
import { selectEditor, setLibraryItemDrag } from 'state/common';
import { D3DragEvent, drag, select } from 'd3';
import { useSelector } from 'react-redux';
import { ZoomTool } from 'ketcher-core';

const RnaPresetItem = ({
  preset,
  isSelected,
  onClick = EmptyFunction,
  onContextMenu = EmptyFunction,
  onMouseLeave = EmptyFunction,
  onMouseMove = EmptyFunction,
}: IRNAPresetItemProps) => {
  const dispatch = useAppDispatch();

  const editor = useSelector(selectEditor);

  const layoutMode = useLayoutMode();

  const cardRef = useRef<HTMLDivElement>(null);

  const addFavorite = useCallback(
    (event: MouseEvent): void => {
      event.stopPropagation();
      dispatch(togglePresetFavorites(preset));
    },
    [dispatch, preset],
  );

  useEffect(() => {
    if (!cardRef.current) {
      return;
    }

    const cardElement = select(cardRef.current);

    const dragBehavior = drag<HTMLDivElement, unknown>()
      .on('start', (event: D3DragEvent<HTMLDivElement, unknown, unknown>) => {
        const { clientX: x, clientY: y } = event.sourceEvent;

        dispatch(
          setLibraryItemDrag({
            item: preset,
            position: { x, y },
          }),
        );
      })
      .on('drag', (event: D3DragEvent<HTMLDivElement, unknown, unknown>) => {
        const { clientX: x, clientY: y } = event.sourceEvent;

        dispatch(
          setLibraryItemDrag({
            item: preset,
            position: { x, y },
          }),
        );
      })
      .on('end', (event: D3DragEvent<HTMLDivElement, unknown, unknown>) => {
        const { clientX: x, clientY: y } = event.sourceEvent;
        const canvasWrapperBoundingClientRect = ZoomTool.instance.canvasWrapper
          .node()
          ?.getBoundingClientRect();
        if (canvasWrapperBoundingClientRect) {
          const { top, left, right, bottom } = canvasWrapperBoundingClientRect;
          const mouseWithinCanvas =
            x >= left && x <= right && y >= top && y <= bottom;
          if (mouseWithinCanvas) {
            editor?.events.placeLibraryItemOnCanvas.dispatch(preset, {
              x: x - left,
              y: y - top,
            });
          }
        }

        dispatch(setLibraryItemDrag(null));
      });

    if (layoutMode !== 'sequence-layout-mode') {
      cardElement.call(dragBehavior);
    }

    return () => {
      cardElement.on('.drag', null);
    };
  }, [dispatch, preset, editor?.events.placeLibraryItemOnCanvas, layoutMode]);

  return (
    <Card
      data-testid={getPresetUniqueKey(preset)}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      selected={isSelected}
      code={preset.name}
      data-rna-preset-item-name={preset.name}
      ref={cardRef}
    >
      <span>{preset.name}</span>
      <StyledIcon
        name="vertical-dots"
        className="dots"
        onClick={onContextMenu}
      ></StyledIcon>
      <div
        aria-hidden
        onClick={addFavorite}
        className={`star ${preset.favorite ? 'visible' : ''}`}
      >
        {FavoriteStarSymbol}
      </div>
    </Card>
  );
};

export default memo(RnaPresetItem);
