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
import { Card, CardTitle, NumberCircle } from './styles';
import { IMonomerItemProps } from './types';
import { MONOMER_TYPES } from '../../../constants';
import useDisabledForSequenceMode from 'components/monomerLibrary/monomerLibraryItem/hooks/useDisabledForSequenceMode';
import { isAmbiguousMonomerLibraryItem, MonomerItemType } from 'ketcher-core';

const MonomerItem = ({
  item,
  groupName,
  onMouseLeave,
  onMouseMove,
  isSelected,
  disabled,
  onClick = EmptyFunction,
}: IMonomerItemProps) => {
  const [favorite, setFavorite] = useState(item.favorite);
  const dispatch = useAppDispatch();
  const isDisabled =
    useDisabledForSequenceMode(item as MonomerItemType, groupName) || disabled;
  const colorCode = isAmbiguousMonomerLibraryItem(item)
    ? ''
    : item.props.MonomerType === MONOMER_TYPES.CHEM
    ? item.props.MonomerType
    : item.props.MonomerNaturalAnalogCode;

  const monomerKey: string = getMonomerUniqueKey(item);

  return (
    <Card
      selected={isSelected}
      disabled={isDisabled}
      data-testid={monomerKey}
      data-monomer-item-id={monomerKey}
      isVariantMonomer={item.isAmbiguous}
      code={colorCode}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      {...(!isDisabled ? { onClick } : {})}
    >
      <CardTitle>{item.label}</CardTitle>
      {!isDisabled && (
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
      )}
      {isAmbiguousMonomerLibraryItem(item) && (
        <NumberCircle
          selected={isSelected}
          monomersAmount={item.monomers.length}
        >
          {item.monomers.length}
        </NumberCircle>
      )}
    </Card>
  );
};

export { MonomerItem };
