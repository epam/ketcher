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
import { memo, MouseEvent, useCallback, useRef } from 'react';
import { StyledIcon } from 'components/monomerLibrary/RnaBuilder/RnaElementsView/Summary/styles';
import { useAppDispatch, useAppSelector } from 'hooks';
import { togglePresetFavorites } from 'state/rna-builder';
import { getPresetUniqueKey } from 'state/library';
import { FavoriteStarSymbol } from '../../../constants';
import { useLibraryItemDrag } from '../monomerLibraryItem/hooks/useLibraryItemDrag';
import { AutochainIcon } from 'components/monomerLibrary/monomerLibraryItem/styles';
import { selectEditor } from 'state/common';

const RnaPresetItem = ({
  preset,
  isSelected,
  onClick = EmptyFunction,
  onContextMenu = EmptyFunction,
  onMouseLeave = EmptyFunction,
  onMouseMove = EmptyFunction,
}: IRNAPresetItemProps) => {
  const dispatch = useAppDispatch();
  const editor = useAppSelector(selectEditor);

  const cardRef = useRef<HTMLDivElement>(null);

  const addFavorite = useCallback(
    (event: MouseEvent): void => {
      event.stopPropagation();
      dispatch(togglePresetFavorites(preset));
    },
    [dispatch, preset],
  );

  const onAutochainIconClick = useCallback(() => {
    editor?.events.autochain.dispatch(preset);
  }, [dispatch, preset]);

  useLibraryItemDrag(preset, cardRef);

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
      <AutochainIcon
        className="autochain"
        name="monomer-autochain"
        onClick={onAutochainIconClick}
      ></AutochainIcon>
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
