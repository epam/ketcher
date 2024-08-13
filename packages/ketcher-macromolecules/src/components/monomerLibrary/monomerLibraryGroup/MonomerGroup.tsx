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
import { useCallback, useEffect, useState } from 'react';
import { calculateMonomerPreviewTop, EmptyFunction } from 'helpers';
import { debounce } from 'lodash';
import { MonomerItem } from '../monomerLibraryItem';
import {
  GroupContainerColumn,
  GroupContainerRow,
  GroupTitle,
  ItemsContainer,
} from './styles';
import { IMonomerGroupProps } from './types';
import { getMonomerUniqueKey } from 'state/library';
import { MonomerItemType } from 'ketcher-core';
import { useAppDispatch, useAppSelector } from 'hooks';
import {
  MonomerPreviewState,
  PreviewType,
  selectEditor,
  selectShowPreview,
  selectTool,
  showPreview,
} from 'state/common';
import {
  selectActiveRnaBuilderItem,
  selectGroupItemValidations,
} from 'state/rna-builder';
import { NoNaturalAnalogueGroupTitle } from '../../../constants';

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
          if (!(monomerValidations[i] in monomer.props.MonomerCaps)) {
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

  const debouncedShowPreview = useCallback(
    debounce((p) => dispatchShowPreview(p), 500),
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
    if (preview.type === PreviewType.Monomer || !e.currentTarget) {
      return;
    }
    const cardCoordinates = e.currentTarget.getBoundingClientRect();
    const top = monomer ? calculateMonomerPreviewTop(cardCoordinates) : '';
    const style = { right: '-88px', top };
    const previewData: MonomerPreviewState = {
      type: PreviewType.Monomer,
      monomer,
      style,
    };
    debouncedShowPreview(previewData);
  };

  const selectMonomer = (monomer: MonomerItemType) => {
    dispatch(selectTool('monomer'));
    setSelectedItemInGroup(monomer);

    if (['FAVORITES', 'PEPTIDE', 'CHEM'].includes(libraryName ?? '')) {
      editor.events.selectMonomer.dispatch(monomer);
    }

    onItemClick(monomer);
  };

  const isMonomerSelected = (monomer: MonomerItemType) => {
    return selectedItemInGroup
      ? getMonomerUniqueKey(selectedItemInGroup) ===
          getMonomerUniqueKey(monomer)
      : selectedMonomerUniqueKey === getMonomerUniqueKey(monomer);
  };

  const groupWithNoNaturalAnalogue = title === NoNaturalAnalogueGroupTitle;
  const StyledGroupContainer = groupWithNoNaturalAnalogue
    ? GroupContainerColumn
    : GroupContainerRow;

  return (
    <StyledGroupContainer>
      {title && <GroupTitle>{title}</GroupTitle>}
      <ItemsContainer useLeftMargin={groupWithNoNaturalAnalogue}>
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
    </StyledGroupContainer>
  );
};
export { MonomerGroup };
