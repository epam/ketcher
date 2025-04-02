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
import { memo, MouseEvent, useCallback } from 'react';
import { StyledIcon } from 'components/monomerLibrary/RnaBuilder/RnaElementsView/Summary/styles';
import { useAppDispatch } from 'hooks';
import { togglePresetFavorites } from 'state/rna-builder';
import { getPresetUniqueKey } from 'state/library';
import { FavoriteStarSymbol } from '../../../constants';

const RnaPresetItem = ({
  preset,
  isSelected,
  onClick = EmptyFunction,
  onContextMenu = EmptyFunction,
  onMouseLeave = EmptyFunction,
  onMouseMove = EmptyFunction,
}: IRNAPresetItemProps) => {
  const dispatch = useAppDispatch();

  const addFavorite = useCallback(
    (event: MouseEvent): void => {
      event.stopPropagation();
      dispatch(togglePresetFavorites(preset));
    },
    [dispatch, preset],
  );

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
