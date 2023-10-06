/****************************************************************************
 * Copyright 2022 EPAM Systems
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

import { useCallback } from 'react';
import { Menu, MenuProps } from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';
import styles from './ContextMenu.module.less';
import { CONTEXT_MENU_ID } from './contextMenu.types';
import AtomMenuItems from './menuItems/AtomMenuItems';
import BondMenuItems from './menuItems/BondMenuItems';
import FunctionalGroupMenuItems from './menuItems/FunctionalGroupMenuItems';
import SelectionMenuItems from './menuItems/SelectionMenuItems';
import RGroupAttachmentPointMenuItems from './menuItems/RGroupAttachmentPointMenuItems';

const props: Partial<MenuProps> = {
  animation: false,
  className: styles.contextMenu,
};

const ContextMenu: React.FC = () => {
  const { getKetcherInstance } = useAppContext();

  const trackVisibility = useCallback(
    (id: CONTEXT_MENU_ID, visible: boolean) => {
      const editor = getKetcherInstance().editor as Editor;
      if (visible) {
        editor.hoverIcon.hide();
      }
      editor.contextMenu[id] = visible;
    },
    [getKetcherInstance],
  );

  return (
    <>
      <Menu
        {...props}
        id={CONTEXT_MENU_ID.FOR_BONDS}
        onVisibilityChange={(visible) =>
          trackVisibility(CONTEXT_MENU_ID.FOR_BONDS, visible)
        }
      >
        <BondMenuItems />
      </Menu>

      <Menu
        {...props}
        id={CONTEXT_MENU_ID.FOR_ATOMS}
        onVisibilityChange={(visible) =>
          trackVisibility(CONTEXT_MENU_ID.FOR_ATOMS, visible)
        }
      >
        <AtomMenuItems />
      </Menu>

      <Menu
        {...props}
        id={CONTEXT_MENU_ID.FOR_SELECTION}
        onVisibilityChange={(visible) =>
          trackVisibility(CONTEXT_MENU_ID.FOR_SELECTION, visible)
        }
      >
        <SelectionMenuItems />
      </Menu>

      <Menu
        {...props}
        id={CONTEXT_MENU_ID.FOR_FUNCTIONAL_GROUPS}
        onVisibilityChange={(visible) =>
          trackVisibility(CONTEXT_MENU_ID.FOR_FUNCTIONAL_GROUPS, visible)
        }
      >
        <FunctionalGroupMenuItems />
      </Menu>

      <Menu
        {...props}
        id={CONTEXT_MENU_ID.FOR_R_GROUP_ATTACHMENT_POINT}
        onVisibilityChange={(visible) =>
          trackVisibility(CONTEXT_MENU_ID.FOR_R_GROUP_ATTACHMENT_POINT, visible)
        }
      >
        <RGroupAttachmentPointMenuItems />
      </Menu>
    </>
  );
};

export default ContextMenu;
