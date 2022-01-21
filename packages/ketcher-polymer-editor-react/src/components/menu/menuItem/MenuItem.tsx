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
import styled from '@emotion/styled'
import { Icon } from 'components/shared/ui/icon'
import { MenuItemVariant } from 'components/menu/menu.types'

type MenuItemContainerProp = {
  isActive: boolean
} & React.HTMLAttributes<HTMLDivElement>

const MenuItemContainer = styled('div')<MenuItemContainerProp>`
  display: flex;
  align-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
  justify-content: center;
  border-radius: 2px;
  background-color: ${(props) =>
    props.isActive
      ? props.theme.color.icon.activeMenu
      : props.theme.color.background.primary};

  :hover {
    transform: scale(1.2);
  }

  > svg path {
    fill: ${(props) =>
      props.isActive
        ? props.theme.color.icon.clicked
        : props.theme.color.icon.activeMenu};
  }
`

type MenuItemProp = {
  name: MenuItemVariant
  activeItem: MenuItemVariant
  onClick: (name: MenuItemVariant) => void
}

const MenuItem = ({ name, activeItem, onClick }: MenuItemProp) => {
  const isActiveTool = activeItem === name

  return (
    <MenuItemContainer
      isActive={isActiveTool}
      onClick={() => onClick(name)}
      role="button"
    >
      <Icon name={name} />
    </MenuItemContainer>
  )
}

export { MenuItem }
