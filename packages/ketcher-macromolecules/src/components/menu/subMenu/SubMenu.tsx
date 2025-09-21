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
import React, { useRef, useState } from 'react';
import { ClickAwayListener } from '@mui/material';
import { MenuItem } from '../menuItem';
import { useMenuContext } from '../../../hooks/useMenuContext';
import {
  OptionsContainer,
  OptionsItemsCollapse,
  RootContainer,
  StyledDropdownIcon,
  VisibleItem,
} from './styles';
import { EmptyFunction } from 'helpers';
import {
  IconName,
  KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
  usePortalStyle,
} from 'ketcher-react';
import { createPortal } from 'react-dom';
import {
  selectSelectedMenuGroupItem,
  setSelectedMenuGroupItem,
} from 'state/common';
import { useAppDispatch, useAppSelector } from 'hooks';

type SubMenuProps = {
  vertical?: boolean;
  autoSize?: boolean;
  disabled?: boolean;
  needOpenByMenuItemClick?: boolean;
  testId?: string;
  layoutModeButton?: boolean;
  generalTitle?: string;
  activeItem?: IconName;
  subMenuId?: string;
};

const SubMenu = ({
  children,
  vertical = false,
  autoSize = false,
  disabled = false,
  needOpenByMenuItemClick = false,
  testId,
  layoutModeButton = false,
  generalTitle,
  activeItem,
  subMenuId,
}: React.PropsWithChildren<SubMenuProps>) => {
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { isActive } = useMenuContext();
  const [portalStyle] = usePortalStyle([
    ref,
    open,
    vertical,
    KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
  ]);

  const selectedMenuGroupItem = useAppSelector(
    // Need to fix typing for selectors with parameters
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    selectSelectedMenuGroupItem(subMenuId),
  );
  const lastActiveOption = subMenuId ? selectedMenuGroupItem : null;
  const handleDropDownClick = () => {
    if (disabled) return;
    setOpen((prev) => !prev);
  };

  const hideCollapse = () => {
    open && setOpen(false);
  };

  const subComponents = React.Children.map(
    children as JSX.Element[],
    (child) => {
      return child.type === MenuItem ? child : null;
    },
  );

  const options = subComponents
    .map((item) => item.props.itemId)
    .filter((item) => item);
  const activeOptions = options.filter((itemKey) => isActive(itemKey));
  const activeOption = activeOptions[0];

  if (subMenuId && activeOption && activeOption !== lastActiveOption) {
    dispatch(
      setSelectedMenuGroupItem({
        groupName: subMenuId,
        activeItemName: activeOption,
      }),
    );
  }

  const visibleItemId =
    activeItem ?? (activeOption || lastActiveOption || options[0]);
  const visibleItem = subComponents.find(
    (option) => option.props.itemId === visibleItemId,
  );
  const visibleItemTestId = visibleItem?.props.testId;
  const visibleItemTitle = generalTitle ?? visibleItem?.props.title;
  const ketcherEditorRootElement = document.querySelector(
    KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
  );
  return (
    <RootContainer data-testid={testId} ref={ref}>
      <>
        <VisibleItem>
          <MenuItem
            disabled={disabled}
            itemId={visibleItemId}
            title={visibleItemTitle}
            testId={visibleItemTestId}
            onClick={
              needOpenByMenuItemClick ? handleDropDownClick : EmptyFunction
            }
          />
          {open || (
            <StyledDropdownIcon
              className="dropdown"
              name="dropdown"
              onClick={handleDropDownClick}
              isActive={isActive(visibleItemId)}
              dataTestId="dropdown-expand"
            />
          )}
        </VisibleItem>
        {ketcherEditorRootElement &&
          createPortal(
            <OptionsItemsCollapse
              in={open}
              timeout={0}
              style={{ ...portalStyle }}
              unmountOnExit
              onClick={hideCollapse}
            >
              <ClickAwayListener onClickAway={hideCollapse}>
                <OptionsContainer
                  isVertical={vertical}
                  isAutoSize={autoSize}
                  islayoutModeButton={layoutModeButton}
                  data-testid="multi-tool-dropdown"
                >
                  {subComponents.map((component) => component)}
                </OptionsContainer>
              </ClickAwayListener>
            </OptionsItemsCollapse>,
            ketcherEditorRootElement,
          )}
      </>
    </RootContainer>
  );
};

export { SubMenu };
