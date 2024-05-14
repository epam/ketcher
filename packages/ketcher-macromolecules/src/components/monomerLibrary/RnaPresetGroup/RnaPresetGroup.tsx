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

import { calculateNucleoElementPreviewTop } from 'helpers';
import { useAppSelector } from 'hooks';
import { MonomerItemType } from 'ketcher-core';
import { debounce } from 'lodash';
import React, { MouseEvent, ReactElement, useCallback, useMemo } from 'react';
import {
  selectActivePreset,
  setActivePreset,
  setActivePresetForContextMenu,
  setIsEditMode,
  setInvalidPresetError,
} from 'state/rna-builder';
import { useDispatch } from 'react-redux';
import { RnaPresetItem } from 'components/monomerLibrary/RnaPresetItem';
import {
  GroupContainer,
  ItemsContainer,
} from 'components/monomerLibrary/monomerLibraryGroup/styles';
import { selectEditor, selectShowPreview, showPreview } from 'state/common';
import { RNAContextMenu } from 'components/contextMenu/RNAContextMenu';
import { CONTEXT_MENU_ID } from 'components/contextMenu/types';
import { useContextMenu } from 'react-contexify';
import { IRnaPreset } from '../RnaBuilder/types';

export const RnaPresetGroup = ({ presets, duplicatePreset, editPreset }) => {
  const activePreset = useAppSelector(selectActivePreset);
  const editor = useAppSelector(selectEditor);

  const { show } = useContextMenu({ id: CONTEXT_MENU_ID.FOR_RNA });

  const dispatch = useDispatch();

  const validatePreset = (preset: IRnaPreset) => {
    let isBaseValid = true;
    let isSugarValid = true;
    let isPhosphateValid = true;
    if (preset?.base?.props?.MonomerCaps) {
      isBaseValid = 'R1' in preset.base.props.MonomerCaps;
    }
    if (preset?.sugar?.props?.MonomerCaps) {
      if (isBaseValid && preset?.base?.props?.MonomerCaps) {
        isSugarValid = 'R3' in preset.sugar.props.MonomerCaps;
      }
    }
    if (preset?.phosphate?.props?.MonomerCaps) {
      isPhosphateValid = 'R1' in preset.phosphate.props.MonomerCaps;
      if (isSugarValid && preset?.sugar?.props?.MonomerCaps) {
        isSugarValid = 'R2' in preset.sugar.props.MonomerCaps;
      }
    }

    return isBaseValid && isSugarValid && isPhosphateValid;
  };

  const selectPreset = (preset: IRnaPreset) => () => {
    const isPresetValid = validatePreset(preset);

    if (!isPresetValid && preset.name) {
      dispatch(setInvalidPresetError(preset.name));
      return;
    }
    dispatch(setActivePreset(preset));
    editor.events.selectPreset.dispatch(preset);
    if (preset.name === activePreset.name) return;
    dispatch(setIsEditMode(false));
  };

  const getMenuPosition = (currentPresetCard: HTMLElement) => {
    const isDivCard = currentPresetCard instanceof HTMLDivElement;
    if (!isDivCard && currentPresetCard.parentElement) {
      currentPresetCard = currentPresetCard.parentElement;
    }
    const boundingBox = currentPresetCard.getBoundingClientRect();
    const parentBox = currentPresetCard.offsetParent?.getBoundingClientRect();
    const contextMenuWidth = 140;
    let x = boundingBox.right - contextMenuWidth;
    const y = boundingBox.y + boundingBox.height / 2;
    if (parentBox?.x && parentBox?.x > x) {
      x = boundingBox.x;
    }
    return {
      x,
      y,
    };
  };

  // region # Preview
  const preview = useAppSelector(selectShowPreview);

  const dispatchShowPreview = useCallback(
    (payload) => dispatch(showPreview(payload)),
    [dispatch],
  );

  const debouncedShowPreview = useMemo(
    () => debounce((p) => dispatchShowPreview(p), 500),
    [dispatchShowPreview],
  );

  const handleItemMouseLeave = (): void => {
    debouncedShowPreview.cancel();
    dispatch(showPreview(undefined));
  };

  const handleItemMouseMove = (
    preset: IRnaPreset,
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ): void => {
    handleItemMouseLeave();
    if (preview.nucleotide || !e.currentTarget) {
      return;
    }
    const nucleotideParts: ReadonlyArray<MonomerItemType | undefined> = [
      preset.sugar,
      preset.base,
      preset.phosphate,
    ];
    const cardCoordinates = e.currentTarget.getBoundingClientRect();
    const style = {
      right: '10px',
      top: calculateNucleoElementPreviewTop(cardCoordinates),
    };
    debouncedShowPreview({ nucleotide: nucleotideParts, style });
  };
  // endregion # Preview

  const handleContextMenu = (preset: IRnaPreset) => (event: MouseEvent) => {
    event.stopPropagation();
    dispatch(setActivePresetForContextMenu(preset));
    show({
      event,
      props: {
        duplicatePreset,
        editPreset,
      },
      position: getMenuPosition(event.currentTarget as HTMLElement),
    });
  };

  return (
    <GroupContainer data-testid="rna-preset-group">
      <ItemsContainer>
        {presets.map((preset: IRnaPreset, index: number): ReactElement => {
          return (
            <RnaPresetItem
              isSelected={activePreset?.name === preset.name}
              key={`${preset.name}${index}`}
              preset={preset}
              onClick={selectPreset(preset)}
              onContextMenu={handleContextMenu(preset)}
              onMouseMove={(e) => handleItemMouseMove(preset, e)}
              onMouseLeave={handleItemMouseLeave}
            />
          );
        })}
      </ItemsContainer>
      <RNAContextMenu />
    </GroupContainer>
  );
};
