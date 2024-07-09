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
import React, { useState } from 'react';
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

type SubMenuProps = {
  vertical?: boolean;
  disabled?: boolean;
  needOpenByMenuItemClick?: boolean;
  testId?: string;
  layoutModeButton: boolean;
};

const SubMenu = ({
  children,
  vertical = false,
  disabled = false,
  needOpenByMenuItemClick = false,
  testId,
  layoutModeButton = false,
}: React.PropsWithChildren<SubMenuProps>) => {
  const [open, setOpen] = useState(false);
  const { isActive } = useMenuContext();

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
  const activeOption = options.filter((itemKey) => isActive(itemKey));
  const visibleItemId = activeOption.length ? activeOption[0] : options[0];
  const visibleItem = subComponents.find(
    (option) => option.props.itemId === visibleItemId,
  );
  const visibleItemTestId = visibleItem?.props.testId;
  const visibleItemTitle = visibleItem?.props.title;

  return (
    <RootContainer data-testid={testId}>
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
          />
        )}
      </VisibleItem>
      <OptionsItemsCollapse
        in={open}
        timeout="auto"
        unmountOnExit
        onClick={hideCollapse}
      >
        <ClickAwayListener onClickAway={hideCollapse}>
          <OptionsContainer
            isVertical={vertical}
            islayoutModeButton={layoutModeButton}
          >
            {subComponents.map((component) => component)}
          </OptionsContainer>
        </ClickAwayListener>
      </OptionsItemsCollapse>
    </RootContainer>
  );
};

export { SubMenu };
