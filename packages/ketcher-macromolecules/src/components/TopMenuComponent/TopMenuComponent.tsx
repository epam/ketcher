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
import { useAppDispatch, useAppSelector } from 'hooks';
import {
  selectEditor,
  selectEditorActiveTool,
  selectIsSequenceEditInRNABuilderMode,
  selectTool,
} from 'state/common';
import { modalComponentList } from 'components/modal/modalContainer';
import { openModal } from 'state/modal';
import { resetRnaBuilderAfterSequenceUpdate } from 'components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditorExpanded/helpers';
import {
  BaseMonomer,
  generateMenuShortcuts,
  hotkeysConfiguration,
} from 'ketcher-core';
import {
  hasOnlyDeoxyriboseSugars,
  hasOnlyRiboseSugars,
  isAntisenseCreationDisabled,
  isAntisenseOptionVisible,
} from 'components/contextMenu/SelectedMonomersContextMenu/helpers';
import { useState } from 'react';
import { IconName } from 'ketcher-react';
import { CalculateMacromoleculePropertiesButton } from 'components/macromoleculeProperties';

const shortcuts =
  generateMenuShortcuts<typeof hotkeysConfiguration>(hotkeysConfiguration);

export function TopMenuComponent() {
  const dispatch = useAppDispatch();
  const activeTool = useAppSelector(selectEditorActiveTool);
  const editor = useAppSelector(selectEditor);
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
  editor?.events.selectEntities.add((selectedEntities: BaseMonomer[]) => {
    setSelectedEntities(selectedEntities);
    if (
      selectedEntities.length &&
      !isAntisenseCreationDisabled(selectedEntities)
    ) {
      setNeedOpenByMenuItemClick(false);
      if (hasOnlyDeoxyriboseSugars(selectedEntities)) {
        setAntisenseActiveOption('antisenseDnaStrand');
      } else if (hasOnlyRiboseSugars(selectedEntities)) {
        setAntisenseActiveOption('antisenseRnaStrand');
      } else {
        setAntisenseActiveOption('antisenseStrand');
        setNeedOpenByMenuItemClick(true);
      }
    }
  });

  const menuItemChanged = (name) => {
    if (modalComponentList[name]) {
      dispatch(openModal(name));
    } else if (name === 'undo' || name === 'redo') {
      editor.events.selectHistory.dispatch(name);
    } else if (name === 'clear') {
      editor.events.selectTool.dispatch([name]);
      dispatch(selectTool('select-rectangle'));
      editor.events.selectTool.dispatch(['select-rectangle']);
      if (isSequenceEditInRNABuilderMode)
        resetRnaBuilderAfterSequenceUpdate(dispatch, editor);
    } else if (name === 'antisenseRnaStrand' || name === 'antisenseDnaStrand') {
      editor.events.createAntisenseChain.dispatch(
        name === 'antisenseDnaStrand',
      );
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
          title={`Clear Canvas (${shortcuts.clear})`}
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
          title={`Undo (${shortcuts.undo})`}
          disabled={isDisabled}
          testId="undo"
        />
        <Menu.Item
          itemId="redo"
          title={`Redo (${shortcuts.redo})`}
          disabled={isDisabled}
          testId="redo"
        />
      </Menu.Group>
      <Menu.Group isHorizontal={true}>
        <Menu.Submenu
          disabled={
            !selectedEntities?.length ||
            !isAntisenseOptionVisible(selectedEntities) ||
            isAntisenseCreationDisabled(selectedEntities)
          }
          needOpenByMenuItemClick={needOpenByMenuItemClick}
          vertical={true}
          layoutModeButton={true}
          generalTitle="Create Antisense Strand"
          testId="Create Antisense Strand"
          activeItem={antisenseActiveOption}
        >
          <Menu.Item
            itemId="antisenseRnaStrand"
            title={`Create RNA Antisense Strand (${shortcuts.createRnaAntisenseStrand})`}
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
            title={`Create DNA Antisense Strand (${shortcuts.createDnaAntisenseStrand})`}
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
