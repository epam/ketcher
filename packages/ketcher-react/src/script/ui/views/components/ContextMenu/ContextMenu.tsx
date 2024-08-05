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
import React, { useCallback } from 'react';
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
import { createPortal } from 'react-dom';
import { KETCHER_ROOT_NODE_CSS_SELECTOR } from 'src/constants';

const props: Partial<MenuProps> = {
  animation: false,
  className: styles.contextMenu,
};

// potentially not needed anymore
// function BodyPortal(props: React.PropsWithChildren<{ refKey: string }>) {
//   return ReactDOM.createPortal(props.children, document.body, props.refKey);
// }

const ContextMenu: React.FC = () => {
  const { getKetcherInstance } = useAppContext();

  const adjustSubmenuPosition = (submenuElement: HTMLElement) => {
    const rect = submenuElement.getBoundingClientRect();
    const ketcherRootElement = document.querySelector(
      KETCHER_ROOT_NODE_CSS_SELECTOR,
    );
    const ketcherRootElementRect = ketcherRootElement?.getBoundingClientRect();
    const ketcherEditorWidth = ketcherRootElementRect?.width || 0;
    const ketcherEditorHeight = ketcherRootElementRect?.height || 0;
    const ketcherEditorLeft = ketcherRootElementRect?.left || 0;
    const ketcherEditorTop = ketcherRootElementRect?.top || 0;

    if (rect.right - ketcherEditorLeft > ketcherEditorWidth) {
      submenuElement.style.left = 'auto';
      submenuElement.style.right = '100%';
    } else {
      submenuElement.style.left = '100%';
      submenuElement.style.right = 'auto';
    }

    if (rect.bottom - ketcherEditorTop > ketcherEditorHeight) {
      submenuElement.style.top = 'auto';
      submenuElement.style.bottom = '0';
    } else {
      submenuElement.style.top = '0';
      submenuElement.style.bottom = 'auto';
    }
  };

  const resetMenuPosition = (menuElement: HTMLElement) => {
    const contextMenuElement = menuElement;
    const ketcherRootElement = document.querySelector(
      KETCHER_ROOT_NODE_CSS_SELECTOR,
    );

    if (!contextMenuElement || !ketcherRootElement) {
      return;
    }

    const contextMenuElementBoundingBox =
      contextMenuElement.getBoundingClientRect();
    const ketcherRootElementBoundingBox =
      ketcherRootElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (!contextMenuElementBoundingBox || !ketcherRootElementBoundingBox) {
      return;
    }

    let left = contextMenuElementBoundingBox.left;
    let top = contextMenuElementBoundingBox.top;

    // Ensure the menu is within the Ketcher root element
    if (
      contextMenuElementBoundingBox.right > ketcherRootElementBoundingBox.right
    ) {
      left =
        ketcherRootElementBoundingBox.right -
        contextMenuElementBoundingBox.width;
    }

    if (
      contextMenuElementBoundingBox.bottom >
      ketcherRootElementBoundingBox.bottom
    ) {
      top =
        ketcherRootElementBoundingBox.bottom -
        contextMenuElementBoundingBox.height;
    }

    // Ensure the menu is within the viewport
    if (left < 0) {
      left = 0;
    }

    if (top < 0) {
      top = 0;
    }

    if (contextMenuElementBoundingBox.right > viewportWidth) {
      left = viewportWidth - contextMenuElementBoundingBox.width - 10;
    }

    if (contextMenuElementBoundingBox.bottom > viewportHeight) {
      top = viewportHeight - contextMenuElementBoundingBox.height - 10;
    }

    contextMenuElement.style.left = `${left}px`;
    contextMenuElement.style.top = `${top}px`;
  };

  const trackVisibility = useCallback(
    (id: CONTEXT_MENU_ID, visible: boolean) => {
      const editor = getKetcherInstance().editor as Editor;
      if (visible) {
        editor.hoverIcon.hide();
        const contextMenuElement = document.querySelector(
          '.contexify:last-of-type',
        ) as HTMLDivElement | null;
        const submenuElements = document.querySelectorAll(
          '.contexify_submenu',
        ) as NodeListOf<HTMLElement>;
        if (contextMenuElement) {
          // Timeout is needed to ensure that the context menu is rendered by react-contexify library.
          // Without timeout library overrides the position of the context menu which we set.
          setTimeout(() => resetMenuPosition(contextMenuElement), 0);
        }

        if (submenuElements.length) {
          submenuElements.forEach((submenuElement) => {
            adjustSubmenuPosition(submenuElement);
          });
        }
      }
      editor.contextMenu[id] = visible;
    },
    [getKetcherInstance],
  );

  const ketcherEditorRootElement = document.querySelector(
    KETCHER_ROOT_NODE_CSS_SELECTOR,
  );

  return ketcherEditorRootElement
    ? createPortal(
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
              trackVisibility(
                CONTEXT_MENU_ID.FOR_R_GROUP_ATTACHMENT_POINT,
                visible,
              )
            }
          >
            <RGroupAttachmentPointMenuItems />
          </Menu>
        </>,
        ketcherEditorRootElement,
      )
    : null;
};

export default ContextMenu;
