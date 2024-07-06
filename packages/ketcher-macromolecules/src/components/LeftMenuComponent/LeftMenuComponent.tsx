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
import {
  ModeTypes,
  generateMenuShortcuts,
  hotkeysConfiguration,
} from 'ketcher-core';

const shortcuts =
  generateMenuShortcuts<typeof hotkeysConfiguration>(hotkeysConfiguration);

export function LeftMenuComponent() {
  const activeTool = useAppSelector(selectEditorActiveTool);
  const editor = useAppSelector(selectEditor);
  const isSequenceMode = useLayoutMode() === ModeTypes.sequence;
  const activeMenuItems = [activeTool];

  const menuItemChanged = (name) => {
    editor.events.selectTool.dispatch(name);
  };

  return (
    <Menu
      testId="left-toolbar"
      onItemClick={menuItemChanged}
      activeMenuItems={activeMenuItems}
    >
      <Menu.Group divider={true}>
        <Menu.Item
          itemId="select-rectangle"
          title="Select Rectangle"
          testId="select-rectangle"
        />
        <Menu.Item
          itemId="erase"
          title={`Erase (${shortcuts.erase})`}
          testId="erase"
          disabled={isSequenceMode}
        />
      </Menu.Group>
      <Menu.Group>
        <Menu.Item
          itemId="bond-single"
          title="Single Bond (1)"
          testId="single-bond"
          disabled={isSequenceMode}
        />
      </Menu.Group>
    </Menu>
  );
}
