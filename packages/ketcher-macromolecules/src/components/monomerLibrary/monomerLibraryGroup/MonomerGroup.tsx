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
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
  selectActiveRnaBuilderItem,
  selectGroupItemValidations,
} from 'state/rna-builder';

const MonomerGroup = ({
  items,
  title,
  groupName,
  selectedMonomerUniqueKey,
  libraryName,
  disabled,
  onItemClick = EmptyFunction,
}: IMonomerGroupProps) => {
  const dispatch = useAppDispatch();
  const preview = useAppSelector(selectShowPreview);
  const editor = useAppSelector(selectEditor);
  const activeMonomerGroup = useAppSelector(selectActiveRnaBuilderItem);
  const activeGroupItemValidations = useAppSelector(selectGroupItemValidations);

  const isMonomerDisabled = (monomer: MonomerItemType) => {
    let monomerDisabled = false;
    if (disabled) {
      monomerDisabled = disabled;
    } else {
      const monomerValidations =
        activeGroupItemValidations[`${monomer.props.MonomerClass}s`];
      if (monomerValidations?.length > 0 && monomer.props.MonomerCaps) {
        for (let i = 0; i < monomerValidations.length; i++) {
          if (monomerValidations[0] in monomer.props.MonomerCaps) {
            monomerDisabled = false;
          } else {
            monomerDisabled = true;
          }
        }
      }
    }
    return monomerDisabled;
  };

  const [selectedItemInGroup, setSelectedItemInGroup] =
    useState<MonomerItemType | null>(null);

  useEffect(() => {
    setSelectedItemInGroup(null);
  }, [activeMonomerGroup]);

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
    handleItemMouseLeave();
    if (preview.monomer || !e.currentTarget) {
      return;
    }
    const cardCoordinates = e.currentTarget.getBoundingClientRect();
    const previewStyle = calculatePreviewPosition(monomer, cardCoordinates);
    const style = { top: previewStyle, right: '-88px' };
    debouncedShowPreview({ monomer, style });
  };

  const selectMonomer = (monomer: MonomerItemType) => {
    dispatch(selectTool('monomer'));
    setSelectedItemInGroup(monomer);

    if (['FAVORITES', 'PEPTIDE', 'CHEM'].includes(libraryName ?? '')) {
      editor.events.selectMonomer.dispatch(monomer);
    }
    console.log('selectMonomer', monomer);

    onItemClick(monomer);
  };

  const isMonomerSelected = (monomer: MonomerItemType) => {
    return selectedItemInGroup
      ? getMonomerUniqueKey(selectedItemInGroup) ===
          getMonomerUniqueKey(monomer)
      : selectedMonomerUniqueKey === getMonomerUniqueKey(monomer);
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
              disabled={isMonomerDisabled(monomer)}
              item={monomer}
              groupName={groupName}
              isSelected={isMonomerSelected(monomer)}
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
