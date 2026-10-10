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
import { useAppSelector, useLayoutMode } from 'hooks';
import { selectEditor, selectEditorActiveTool } from 'state/common';
import { hotkeysShortcuts } from 'components/ZoomControls/helpers';
import { SELECT_SUBMENU_ID } from 'components/menu/constants';
import { useTranslation } from 'react-i18next';

export function LeftMenuComponent() {
  const { t } = useTranslation('macromolecules');
  const activeTool = useAppSelector(selectEditorActiveTool);
  const editor = useAppSelector(selectEditor);
  const isSequenceMode = useLayoutMode() === 'sequence-layout-mode';
  const activeMenuItems = [activeTool];

  const menuItemChanged = (name) => {
    editor?.events.selectTool.dispatch([name, { toolName: name }]);
  };

  return (
    <Menu
      testId="left-toolbar"
      onItemClick={menuItemChanged}
      activeMenuItems={activeMenuItems}
    >
      <Menu.Group divider={true}>
        <Menu.Item
          itemId="hand"
          title={t('leftMenu.handTool', { shortcut: hotkeysShortcuts.hand })}
          testId="hand"
        />
        <Menu.Group>
          <Menu.Submenu
            testId="select-drop-down-button"
            subMenuId={SELECT_SUBMENU_ID}
            needOpenByMenuItemClick={true}
          >
            <Menu.Item
              itemId="select-rectangle"
              title={t('leftMenu.selectRectangle', {
                shortcut: hotkeysShortcuts.switchSelectTool,
              })}
              testId="select-rectangle"
            />
            <Menu.Item
              itemId="select-lasso"
              title={t('leftMenu.lassoSelection', {
                shortcut: hotkeysShortcuts.switchSelectTool,
              })}
              testId="select-lasso"
            />
            <Menu.Item
              itemId="select-structure"
              title={t('leftMenu.structureSelection', {
                shortcut: hotkeysShortcuts.switchSelectTool,
              })}
              testId="select-structure"
            />
          </Menu.Submenu>
        </Menu.Group>
        <Menu.Item
          itemId="erase"
          title={t('leftMenu.erase', { shortcut: hotkeysShortcuts.erase })}
          testId="erase"
          disabled={isSequenceMode}
        />
      </Menu.Group>
      <Menu.Group>
        <Menu.Submenu
          disabled={isSequenceMode}
          testId="bonds-drop-down-button"
          needOpenByMenuItemClick={false}
        >
          <Menu.Item
            itemId="bond-single"
            title={t('leftMenu.singleBond')}
            testId="single-bond"
            disabled={isSequenceMode}
          />
          <Menu.Item
            itemId="bond-hydrogen"
            title={t('leftMenu.hydrogenBond')}
            testId="hydrogen-bond"
            disabled={isSequenceMode}
          />
        </Menu.Submenu>
      </Menu.Group>
    </Menu>
  );
}
