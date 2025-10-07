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
import { useAppDispatch, useAppSelector } from 'hooks';
import { useCallback, MouseEvent, useRef, useState } from 'react';
import { getMonomerUniqueKey, toggleMonomerFavorites } from 'state/library';
import {
  AutochainIcon,
  AutochainIconWrapper,
  Card,
  CardTitle,
  NumberCircle,
} from './styles';
import { IMonomerItemProps } from './types';
import { FavoriteStarSymbol, MONOMER_TYPES } from '../../../constants';
import useDisabledForSequenceMode from 'components/monomerLibrary/monomerLibraryItem/hooks/useDisabledForSequenceMode';
import { isAmbiguousMonomerLibraryItem, MonomerItemType } from 'ketcher-core';
import { useLibraryItemDrag } from 'components/monomerLibrary/monomerLibraryItem/hooks/useLibraryItemDrag';
import { selectEditor, selectIsSequenceMode } from 'state/common';
import Tooltip from '@mui/material/Tooltip';
import { cardMouseOverHandler } from 'components/monomerLibrary/monomerLibraryItem/shared';

export const AUTOCHAIN_ELEMENT_CLASSNAME = 'autochain';

const MonomerItem = ({
  item,
  groupName,
  onMouseLeave,
  onMouseMove,
  isSelected,
  disabled,
  onClick = EmptyFunction,
}: IMonomerItemProps) => {
  const dispatch = useAppDispatch();
  const editor = useAppSelector(selectEditor);
  const isSequenceMode = useAppSelector(selectIsSequenceMode);
  const [autochainErrorMessage, setAutochainErrorMessage] =
    useState<string>('');

  const cardRef = useRef<HTMLDivElement>(null);

  const isDisabled =
    useDisabledForSequenceMode(item as MonomerItemType, groupName) || disabled;
  let colorCode = '';

  if (!isAmbiguousMonomerLibraryItem(item)) {
    colorCode =
      item.props.MonomerType === MONOMER_TYPES.CHEM
        ? item.props.MonomerType
        : item.props.MonomerNaturalAnalogCode;
  }

  const monomerKey: string = getMonomerUniqueKey(item);
  const monomerItem = isAmbiguousMonomerLibraryItem(item)
    ? undefined
    : (item as MonomerItemType);

  const addFavorite = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      dispatch(toggleMonomerFavorites(item));
    },
    [dispatch, item],
  );

  const handleFavoriteKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        dispatch(toggleMonomerFavorites(item));
      }
    },
    [dispatch, item],
  );

  const onAutochainIconClick = useCallback(
    (event) => {
      event.stopPropagation();

      if (autochainErrorMessage) {
        return;
      }

      editor?.events.autochain.dispatch(item);
    },
    [editor, autochainErrorMessage, item],
  );

  const onMouseOver = useCallback(
    () =>
      editor && cardMouseOverHandler(editor, item, setAutochainErrorMessage),
    [editor, item],
  );

  const onAutochainIconMouseOver = useCallback(() => {
    if (autochainErrorMessage) {
      return;
    }

    editor?.events.previewAutochain.dispatch(item);
  }, [autochainErrorMessage, editor, item]);

  const onAutochainIconMouseOut = useCallback(() => {
    editor?.events.removeAutochainPreview.dispatch(item);
  }, [editor, item]);

  // TODO suppressed after upgrade to react 19. Need to fix
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  useLibraryItemDrag(item, cardRef);

  return (
    <Card
      selected={isSelected}
      disabled={isDisabled}
      data-testid={monomerKey}
      data-monomer-item-id={monomerKey}
      item={monomerItem}
      isVariantMonomer={item.isAmbiguous}
      code={colorCode}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      onDoubleClick={(e) => {
        onAutochainIconClick(e);
        onAutochainIconMouseOut();
      }}
      {...(!isDisabled ? { onClick } : {})}
      ref={cardRef}
    >
      <CardTitle>{item.label}</CardTitle>
      {!isDisabled && (
        <>
          {!isSequenceMode && (
            <Tooltip title={autochainErrorMessage}>
              <AutochainIconWrapper>
                <AutochainIcon
                  className={AUTOCHAIN_ELEMENT_CLASSNAME}
                  name="monomer-autochain"
                  disabled={Boolean(autochainErrorMessage)}
                  onMouseOver={onAutochainIconMouseOver}
                  onMouseOut={onAutochainIconMouseOut}
                  onClick={onAutochainIconClick}
                  onDoubleClick={(e) => e.stopPropagation()}
                />
              </AutochainIconWrapper>
            </Tooltip>
          )}
          <div
            onClick={addFavorite}
            onKeyDown={handleFavoriteKeyDown}
            className={`star ${item.favorite ? 'visible' : ''}`}
            role="button"
            tabIndex={0}
            aria-label="Toggle favorite"
          >
            {FavoriteStarSymbol}
          </div>
        </>
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
