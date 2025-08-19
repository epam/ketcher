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
import {
  CoreEditor,
  isAmbiguousMonomerLibraryItem,
  MonomerItemType,
  MonomerOrAmbiguousType,
} from 'ketcher-core';
import { useLibraryItemDrag } from 'components/monomerLibrary/monomerLibraryItem/hooks/useLibraryItemDrag';
import { selectEditor, selectIsSequenceMode } from 'state/common';
import Tooltip from '@mui/material/Tooltip';

export const cardMouseOverHandler = (
  editor: CoreEditor,
  monomerOrAmbiguousItem: MonomerOrAmbiguousType,
  setAutochainErrorMessage: (message: string) => void,
) => {
  setAutochainErrorMessage('');

  const { selectedMonomersWithFreeR2 } = editor.getDataForAutochain();
  const selectedMonomers = editor.drawingEntitiesManager.selectedMonomers;

  if (selectedMonomersWithFreeR2.length > 1) {
    setAutochainErrorMessage(
      'Select a monomer or a chain that has one R2 available.',
    );
  }
};

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
  const [autochainErrorMessage, setAutochainErrorMessage] = useState<
    string | null
  >(null);

  const cardRef = useRef<HTMLDivElement>(null);

  const isDisabled =
    useDisabledForSequenceMode(item as MonomerItemType, groupName) || disabled;
  const colorCode = isAmbiguousMonomerLibraryItem(item)
    ? ''
    : item.props.MonomerType === MONOMER_TYPES.CHEM
    ? item.props.MonomerType
    : item.props.MonomerNaturalAnalogCode;

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
    // if (selectedMonomers.length === 1 && item.) {
    //   setAutochainErrorMessage(
    //     'Select a monomer or a chain that has one R2 available.',
    //   );
    //
    //   return;
    // }

    if (autochainErrorMessage) {
      return;
    }

    editor?.events.previewAutochain.dispatch(item);
  }, [autochainErrorMessage, editor, item]);

  const onAutochainIconMouseOut = useCallback(() => {
    editor?.events.removeAutochainPreview.dispatch(item);
  }, [editor, item]);

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
              className="autochain"
              name="monomer-autochain"
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
            className={`star ${item.favorite ? 'visible' : ''}`}
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
