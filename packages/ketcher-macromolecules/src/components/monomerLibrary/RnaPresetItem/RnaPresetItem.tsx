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
import { IRnaPresetItemrops } from './types';
import { useState } from 'react';
import { StyledIcon } from '../RnaBuilder/RnaAccordion/Summary/styles';
import { useAppDispatch } from 'hooks';
import { togglePresetFavorites } from 'state/rna-builder';
import { getPresetUniqueKey } from 'state/library';

const RnaPresetItem = ({
  preset,
  isSelected,
  onClick = EmptyFunction,
  onContextMenu = EmptyFunction,
}: IRnaPresetItemrops) => {
  const [showDots, setShowDots] = useState(false);
  const [favorite, setFavorite] = useState(preset.favorite);
  const dispatch = useAppDispatch();
  const onMouseOver = () => {
    setShowDots(true);
  };
  const onMouseOut = () => {
    setShowDots(false);
  };
  const addFavorite = (event) => {
    event.stopPropagation();
    setFavorite(!favorite);
    dispatch(togglePresetFavorites(preset));
  };

  return (
    <Card
      data-testid={getPresetUniqueKey(preset)}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      selected={isSelected}
      code={preset.name}
      data-rna-preset-item-name={preset.name}
    >
      <span>{preset.name}</span>
      <StyledIcon
        name="vertical-dots"
        className={showDots ? 'dots' : 'dots hidden'}
        onClick={onContextMenu}
      ></StyledIcon>
      <div
        aria-hidden
        onClick={addFavorite}
        className={`star ${favorite ? 'visible' : ''}`}
      >
        ★
      </div>
    </Card>
  );
};

export { RnaPresetItem };
