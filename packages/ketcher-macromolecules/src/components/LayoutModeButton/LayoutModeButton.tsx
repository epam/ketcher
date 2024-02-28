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

import { useEffect, useState } from 'react';
import { Menu } from 'components/menu';
import { MenuContext } from '../../contexts';
import { useAppSelector, useLayoutMode } from 'hooks';
import { selectEditor } from 'state/common';

export const LayoutModeButton = () => {
  const [activeMode, setActiveMode] = useState('flex-layout-mode');
  const editor = useAppSelector(selectEditor);
  const layoutMode = useLayoutMode();

  const menuContext = {
    isActive: (mode) => activeMode === mode,
    activate: (mode) => {
      if (mode === activeMode) {
        return;
      }
      setActiveMode(mode);
      // event to change active mode state in editor
      editor.events.selectMode.dispatch(mode);
      // event to change active mode state in useLayoutMode hook
      editor.events.layoutModeChange.dispatch(mode);
    },
  };
  useEffect(() => {
    setActiveMode(layoutMode);
  }, [layoutMode]);
  return (
    <MenuContext.Provider value={menuContext}>
      <Menu.Submenu
        testId="layout-mode"
        vertical={true}
        needOpenByMenuItemClick={true}
      >
        <Menu.Item
          itemId="flex-layout-mode"
          testId="flex-layout-mode"
        ></Menu.Item>
        <Menu.Item
          itemId="snake-layout-mode"
          testId="snake-layout-mode"
        ></Menu.Item>
        <Menu.Item
          itemId="sequence-layout-mode"
          testId="sequence-layout-mode"
        ></Menu.Item>
      </Menu.Submenu>
    </MenuContext.Provider>
  );
};
