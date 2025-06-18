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

export function LeftMenuComponent() {
  const activeTool = useAppSelector(selectEditorActiveTool);
  const editor = useAppSelector(selectEditor);
  const isSequenceMode = useLayoutMode() === 'sequence-layout-mode';
  const activeMenuItems = [activeTool];

  const menuItemChanged = (name) => {
    editor.events.selectTool.dispatch([name, { toolName: name }]);
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
          title={`Hand Tool (${hotkeysShortcuts.hand})`}
          testId="hand"
        />
        <Menu.Item
          itemId="select-rectangle"
          title={`Select Rectangle  (${hotkeysShortcuts.exit})`}
          testId="select-rectangle"
        />
        <Menu.Item
          itemId="erase"
          title={`Erase (${hotkeysShortcuts.erase})`}
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
            title="Single Bond (1)"
            testId="single-bond"
            disabled={isSequenceMode}
          />
          <Menu.Item
            itemId="bond-hydrogen"
            title="Hydrogen Bond (2)"
            testId="hydrogen-bond"
            disabled={isSequenceMode}
          />
        </Menu.Submenu>
      </Menu.Group>
    </Menu>
  );
}
