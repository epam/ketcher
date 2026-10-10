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

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu } from 'components/menu';
import { MenuContext } from '../../contexts';
import { useAppSelector, useLayoutMode } from 'hooks';
import {
  selectEditor,
  selectIsSequenceEditInRNABuilderMode,
} from 'state/common';

export const LayoutModeButton = () => {
  const { t } = useTranslation('macromolecules');
  const editor = useAppSelector(selectEditor);
  const layoutMode = useLayoutMode();
  const isSequenceEditInRNABuilderMode = useAppSelector(
    selectIsSequenceEditInRNABuilderMode,
  );

  const menuContext = useMemo(
    () => ({
      isActive: (mode) => layoutMode === mode,
      activate: (mode) => {
        if (mode === layoutMode) {
          return;
        }
        // event to change active mode state in editor
        editor?.events.selectMode.dispatch(mode);
        // event to change active mode state in useLayoutMode hook
        editor?.events.layoutModeChange.dispatch(mode);
      },
    }),
    [layoutMode, editor],
  );

  return (
    <MenuContext.Provider value={menuContext}>
      <Menu.Submenu
        disabled={isSequenceEditInRNABuilderMode}
        testId="layout-mode"
        vertical={true}
        needOpenByMenuItemClick={true}
        layoutModeButton={true}
      >
        <Menu.Item
          itemId="sequence-layout-mode"
          testId="sequence-layout-mode"
          title={t('layoutMode.switchToSequence')}
        ></Menu.Item>
        <Menu.Item
          itemId="snake-layout-mode"
          testId="snake-layout-mode"
          title={t('layoutMode.switchToSnake')}
        ></Menu.Item>
        <Menu.Item
          itemId="flex-layout-mode"
          testId="flex-layout-mode"
          title={t('layoutMode.switchToFlex')}
        ></Menu.Item>
      </Menu.Submenu>
    </MenuContext.Provider>
  );
};
