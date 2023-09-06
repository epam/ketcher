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
import { useCallback, useMemo } from 'react';
import { EmptyFunction } from 'helpers';
import { debounce } from 'lodash';
import { MonomerItem } from '../monomerLibraryItem';
import { GroupContainer, GroupTitle, ItemsContainer } from './styles';
import { IMonomerGroupProps } from './types';
import { getMonomerUniqueKey } from 'state/library';
import { MonomerItemType } from 'ketcher-core';
import { calculatePreviewPosition } from '../../../helpers';
import { useAppDispatch, useAppSelector } from 'hooks';
import {
  showPreview,
  selectShowPreview,
  selectEditor,
  selectTool,
} from 'state/common';

const MonomerGroup = ({
  items,
  title,
  selectedMonomerUniqueKey,
  libraryName,
  disabled,
  onItemClick = EmptyFunction,
}: IMonomerGroupProps) => {
  const dispatch = useAppDispatch();
  const preview = useAppSelector(selectShowPreview);
  const editor = useAppSelector(selectEditor);

  const dispatchShowPreview = useCallback(
    (payload) => dispatch(showPreview(payload)),
    [dispatch],
  );

  const debouncedShowPreview = useMemo(
    () => debounce((p) => dispatchShowPreview(p), 500),
    [dispatchShowPreview],
  );

  const handleItemMouseLeave = () => {
    debouncedShowPreview.cancel();
    dispatch(showPreview(undefined));
  };

  const handleItemMouseMove = (
    monomer: MonomerItemType,
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (preview.monomer || !e.currentTarget) {
      return;
    }
    const cardCoordinates = e.currentTarget.getBoundingClientRect();
    const previewStyle = calculatePreviewPosition(monomer, cardCoordinates);
    debouncedShowPreview({ monomer, style: previewStyle });
  };

  const selectMonomer = (monomer: MonomerItemType) => {
    dispatch(selectTool('monomer'));
    switch (libraryName) {
      case 'PEPTIDE':
        editor.events.selectMonomer.dispatch(monomer);
        onItemClick(monomer);
        break;
      case 'CHEM':
        editor.events.selectMonomer.dispatch(monomer);
        onItemClick(monomer);
        break;
      default:
        onItemClick(monomer);
        break;
    }
  };

  return (
    <GroupContainer>
      {title && (
        <GroupTitle>
          <span>{title}</span>
        </GroupTitle>
      )}
      <ItemsContainer>
        {items.map((monomer) => {
          const key = monomer.props
            ? `${monomer.props.MonomerName + monomer.props.Name}`
            : monomer.label;
          return (
            <MonomerItem
              key={key}
              disabled={disabled}
              item={monomer}
              isSelected={
                selectedMonomerUniqueKey === getMonomerUniqueKey(monomer)
              }
              onMouseLeave={handleItemMouseLeave}
              onMouseMove={(e) => handleItemMouseMove(monomer, e)}
              onClick={() => selectMonomer(monomer)}
            />
          );
        })}
      </ItemsContainer>
    </GroupContainer>
  );
};
export { MonomerGroup };
