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

import { Menu } from 'components/menu';
import { useAppDispatch, useAppSelector, useLayoutMode } from 'hooks';
import {
  selectLastSelectedSelectionMenuItem,
  selectEditor,
  selectEditorActiveTool,
  selectIsSequenceEditInRNABuilderMode,
} from 'state/common';
import { modalComponentList } from 'components/modal/modalContainer';
import { openModal } from 'state/modal';
import { resetRnaBuilderAfterSequenceUpdate } from 'components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditorExpanded/helpers';
import { BaseMonomer } from 'ketcher-core';
import {
  hasOnlyDeoxyriboseSugars,
  hasOnlyRiboseSugars,
  hasUnsplitNucleotide,
  isAntisenseCreationDisabled,
  isAntisenseOptionVisible,
  isCycleExistsForSelectedMonomers,
} from 'components/contextMenu/SelectedMonomersContextMenu/helpers';
import { useEffect, useState } from 'react';
import { IconName } from 'ketcher-react';
import { CalculateMacromoleculePropertiesButton } from 'components/macromoleculeProperties';
import { hotkeysShortcuts } from 'components/ZoomControls/helpers';
import { useTranslation } from 'react-i18next';

export function TopMenuComponent() {
  const { t } = useTranslation('macromolecules');
  const dispatch = useAppDispatch();
  const activeTool = useAppSelector(selectEditorActiveTool);
  const editor = useAppSelector(selectEditor);
  const layoutMode = useLayoutMode();
  const isSequenceEditInRNABuilderMode = useAppSelector(
    selectIsSequenceEditInRNABuilderMode,
  );
  const [selectedEntities, setSelectedEntities] = useState<BaseMonomer[]>([]);
  const [needOpenByMenuItemClick, setNeedOpenByMenuItemClick] =
    useState<boolean>(false);
  const [antisenseActiveOption, setAntisenseActiveOption] =
    useState<IconName>();
  const activeMenuItems = [activeTool];
  const isDisabled = isSequenceEditInRNABuilderMode;
  const lastSelectedSelectionMenuItem = useAppSelector(
    selectLastSelectedSelectionMenuItem,
  );
  const isFlexMode = layoutMode === 'flex-layout-mode';

  const selectedMonomers = selectedEntities.filter(
    (entity) => entity && typeof entity.forEachBond === 'function',
  );

  const cyclicStructureFormationDisabled =
    (editor?.drawingEntitiesManager.selectedMicromoleculeEntities.length ?? 0) >
      0 || !isCycleExistsForSelectedMonomers(selectedMonomers);

  useEffect(() => {
    const selectEntitiesHandler = (selectedEntities: BaseMonomer[]) => {
      setSelectedEntities(selectedEntities);
      if (
        selectedEntities.length &&
        !isAntisenseCreationDisabled(selectedEntities)
      ) {
        setNeedOpenByMenuItemClick(false);
        if (
          !hasUnsplitNucleotide(selectedEntities) &&
          hasOnlyDeoxyriboseSugars(selectedEntities)
        ) {
          setAntisenseActiveOption('antisenseDnaStrand');
        } else if (
          !hasUnsplitNucleotide(selectedEntities) &&
          hasOnlyRiboseSugars(selectedEntities)
        ) {
          setAntisenseActiveOption('antisenseRnaStrand');
        } else {
          setAntisenseActiveOption('antisenseStrand');
          setNeedOpenByMenuItemClick(true);
        }
      }
    };

    editor?.events.selectEntities.add(selectEntitiesHandler);

    return () => {
      editor?.events.selectEntities.remove(selectEntitiesHandler);
    };
  }, [editor]);

  const menuItemChanged = (name) => {
    if (modalComponentList[name]) {
      dispatch(openModal(name));
    } else if (name === 'undo' || name === 'redo') {
      editor?.events.selectHistory.dispatch(name);
    } else if (name === 'clear') {
      editor?.events.resetSequenceEditMode.dispatch();
      editor?.events.selectTool.dispatch([name]);
      editor?.events.selectTool.dispatch([lastSelectedSelectionMenuItem]);
      if (isSequenceEditInRNABuilderMode)
        resetRnaBuilderAfterSequenceUpdate(dispatch, editor);
    } else if (name === 'antisenseRnaStrand' || name === 'antisenseDnaStrand') {
      editor?.events.createAntisenseChain.dispatch(
        name === 'antisenseDnaStrand',
      );
    } else if (name === 'arrange-ring') {
      editor?.events.layoutCircular.dispatch();
    }
  };

  return (
    <Menu
      onItemClick={menuItemChanged}
      activeMenuItems={activeMenuItems}
      isHorizontal={true}
    >
      <Menu.Group isHorizontal={true} divider={true}>
        <Menu.Item
          itemId="clear"
          title={t('topMenu.clearCanvas', { shortcut: hotkeysShortcuts.clear })}
          testId="clear-canvas"
        />
        <Menu.Item
          itemId="open"
          title={t('topMenu.open')}
          disabled={isDisabled}
          testId="open-file-button"
        />
        <Menu.Item
          itemId="save"
          title={t('topMenu.saveAs')}
          testId="save-file-button"
        />
      </Menu.Group>
      <Menu.Group isHorizontal={true} divider={true}>
        <Menu.Item
          itemId="undo"
          title={t('topMenu.undo', { shortcut: hotkeysShortcuts.undo })}
          disabled={isDisabled}
          testId="undo"
        />
        <Menu.Item
          itemId="redo"
          title={t('topMenu.redo', { shortcut: hotkeysShortcuts.redo })}
          disabled={isDisabled}
          testId="redo"
        />
      </Menu.Group>
      {isFlexMode && (
        <Menu.Group isHorizontal={true} divider={true}>
          <Menu.Item
            itemId={'arrange-ring' as IconName}
            title={t('topMenu.arrangeAsRing', {
              shortcut: hotkeysShortcuts.arrangeRing,
            })}
            disabled={cyclicStructureFormationDisabled}
            testId="arrange-ring"
          />
        </Menu.Group>
      )}
      <Menu.Group isHorizontal={true}>
        <Menu.Submenu
          disabled={
            !selectedEntities?.length ||
            !isAntisenseOptionVisible(selectedEntities) ||
            isAntisenseCreationDisabled(selectedEntities)
          }
          needOpenByMenuItemClick={needOpenByMenuItemClick}
          vertical={true}
          autoSize={true}
          layoutModeButton={true}
          generalTitle={t('topMenu.createAntisenseStrand')}
          testId="Create Antisense Strand"
          activeItem={antisenseActiveOption}
        >
          <Menu.Item
            itemId="antisenseRnaStrand"
            title={t('topMenu.createRnaAntisenseStrand', {
              shortcut: hotkeysShortcuts.createRnaAntisenseStrand,
            })}
            disabled={
              !selectedEntities?.length ||
              !isAntisenseOptionVisible(selectedEntities) ||
              isAntisenseCreationDisabled(selectedEntities)
            }
            testId="antisenseRnaStrand"
            type="button"
          />
          <Menu.Item
            itemId="antisenseDnaStrand"
            title={t('topMenu.createDnaAntisenseStrand', {
              shortcut: hotkeysShortcuts.createDnaAntisenseStrand,
            })}
            disabled={
              !selectedEntities?.length ||
              !isAntisenseOptionVisible(selectedEntities) ||
              isAntisenseCreationDisabled(selectedEntities)
            }
            testId="antisenseDnaStrand"
            type="button"
          />
        </Menu.Submenu>
        <CalculateMacromoleculePropertiesButton />
      </Menu.Group>
    </Menu>
  );
}
