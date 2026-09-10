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
import { BaseMonomer, EditorHistory, ketcherProvider } from 'ketcher-core';
import {
  hasOnlyDeoxyriboseSugars,
  hasOnlyRiboseSugars,
  hasUnsplitNucleotide,
  isAntisenseCreationDisabled,
  isAntisenseOptionVisible,
  isCycleExistsForSelectedMonomers,
} from 'components/contextMenu/SelectedMonomersContextMenu/helpers';
import { useEffect, useReducer, useState } from 'react';
import { IconName } from 'ketcher-react';
import { CalculateMacromoleculePropertiesButton } from 'components/macromoleculeProperties';
import { hotkeysShortcuts } from 'components/ZoomControls/helpers';

export function TopMenuComponent() {
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

  // The history lives outside React, so a model change only has to trigger a
  // re-render - the state itself is read while rendering. Keeping it out of an
  // effect matters: an effect runs after the paint, which would leave both
  // buttons briefly disabled on a canvas that does have a history.
  const [, markHistoryChanged] = useReducer(
    (revision: number) => revision + 1,
    0,
  );

  useEffect(() => {
    if (!editor) {
      return;
    }

    // Neither event alone reports every history change at the right moment.
    // `EditorHistory.update` moves the pointer for a command with no
    // operations but skips `modelChange` for it, while `undo`/`redo` dispatch
    // `changeEvent` before moving the pointer. Subscribing to both leaves
    // every path with at least one signal that lands after the move.
    const { changeEvent } = ketcherProvider.getKetcher(editor.ketcherId) ?? {};

    editor.events.modelChange.add(markHistoryChanged);
    changeEvent?.add(markHistoryChanged);

    return () => {
      editor.events.modelChange.remove(markHistoryChanged);
      changeEvent?.remove(markHistoryChanged);
    };
  }, [editor, markHistoryChanged]);

  const history = editor ? EditorHistory.getInstance(editor) : undefined;
  const canUndo = Boolean(history && history.historyPointer > 0);
  const canRedo = Boolean(
    history && history.historyPointer < history.historyStack.length,
  );

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
          title={`Clear Canvas (${hotkeysShortcuts.clear})`}
          testId="clear-canvas"
        />
        <Menu.Item
          itemId="open"
          title="Open..."
          disabled={isDisabled}
          testId="open-file-button"
        />
        <Menu.Item itemId="save" title="Save as..." testId="save-file-button" />
      </Menu.Group>
      <Menu.Group isHorizontal={true} divider={true}>
        <Menu.Item
          itemId="undo"
          title={`Undo (${hotkeysShortcuts.undo})`}
          disabled={isDisabled || !canUndo}
          testId="undo"
        />
        <Menu.Item
          itemId="redo"
          title={`Redo (${hotkeysShortcuts.redo})`}
          disabled={isDisabled || !canRedo}
          testId="redo"
        />
      </Menu.Group>
      {isFlexMode && (
        <Menu.Group isHorizontal={true} divider={true}>
          <Menu.Item
            itemId={'arrange-ring' as IconName}
            title={`Arrange as a Ring (${hotkeysShortcuts.arrangeRing})`}
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
          generalTitle="Create Antisense Strand"
          testId="Create Antisense Strand"
          activeItem={antisenseActiveOption}
        >
          <Menu.Item
            itemId="antisenseRnaStrand"
            title={`Create RNA Antisense Strand (${hotkeysShortcuts.createRnaAntisenseStrand})`}
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
            title={`Create DNA Antisense Strand (${hotkeysShortcuts.createDnaAntisenseStrand})`}
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
