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

type SubMenuProps = {
  vertical?: boolean;
};

const SubMenu = ({
  children,
  vertical = false,
}: React.PropsWithChildren<SubMenuProps>) => {
  const [open, setOpen] = useState(false);
  const { isActive } = useMenuContext();

  const handleDropDownClick = () => {
    setOpen((prev) => !prev);
  };

  const hideCollapse = () => {
    open && setOpen(false);
  };

  const subComponents = React.Children.map(
    children as JSX.Element[],
    (child) => {
      return child.type === MenuItem ? child : null;
    }
  );

  const options = subComponents
    .map((item) => item.props.itemId)
    .filter((item) => item);
  const activeOption = options.filter((itemKey) => isActive(itemKey));
  const visibleItemId = activeOption.length ? activeOption[0] : options[0];

  return (
    <RootContainer>
      <VisibleItem>
        <MenuItem itemId={visibleItemId} />
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
          <OptionsContainer isVertical={vertical}>
            {subComponents.map((component) => component)}
          </OptionsContainer>
        </ClickAwayListener>
      </OptionsItemsCollapse>
    </RootContainer>
  );
};

export { SubMenu };
