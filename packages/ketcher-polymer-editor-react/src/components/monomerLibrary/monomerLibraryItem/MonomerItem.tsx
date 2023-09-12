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
import { useAppDispatch } from 'hooks';
import { useState } from 'react';
import { getMonomerUniqueKey, toggleMonomerFavorites } from 'state/library';
import { Card } from './styles';
import { IMonomerItemProps } from './types';
import { MONOMER_TYPES } from '../../../constants';

const MonomerItem = ({
  item,
  onMouseLeave,
  onMouseMove,
  isSelected,
  disabled,
  onClick = EmptyFunction,
}: IMonomerItemProps) => {
  const [favorite, setFavorite] = useState(item.favorite);
  const dispatch = useAppDispatch();
  const colorCode =
    item.props.MonomerType === MONOMER_TYPES.CHEM
      ? item.props.MonomerType
      : item.props.MonomerNaturalAnalogCode;

  return (
    <Card
      onClick={onClick}
      selected={isSelected}
      disabled={disabled}
      data-testid={getMonomerUniqueKey(item)}
      data-monomer-item-id={getMonomerUniqueKey(item)}
      code={colorCode}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
    >
      <span>{item.label}</span>
      <div
        onClick={(event) => {
          event.stopPropagation();
          setFavorite(!favorite);
          dispatch(toggleMonomerFavorites(item));
        }}
        className={`star ${favorite ? 'visible' : ''}`}
      >
        ★
      </div>
    </Card>
  );
};

export { MonomerItem };
