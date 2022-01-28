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
import { Icon } from 'components/shared/ui/icon'
import { MenuItem as MuiMenuItem } from '@mui/material'
import { css } from '@emotion/react'
import { useMenuContext } from '../../../hooks/useMenuContext'
import { useAppTheme } from 'hooks'
import { useCallback } from 'react'

const StyledMenuButton = ({ isActive, onClick, children }) => {
  const theme = useAppTheme()
  const styles = css`
    display: flex;
    align-items: center;
    width: 32px;
    height: 32px;
    padding: 0;
    justify-content: center;
    border-radius: 2px;
    background-color: ${isActive
      ? theme.color.icon.activeMenu
      : theme.color.background.primary};

    &:hover {
      background: ${isActive
        ? theme.color.icon.activeMenu
        : theme.color.background.primary};
    }

    & > svg path {
      fill: ${isActive
        ? theme.color.icon.clicked
        : theme.color.icon.activeMenu};
    }
  `
  return (
    <MuiMenuItem css={styles} onClick={onClick}>
      {children}
    </MuiMenuItem>
  )
}

type MenuItemProp = {
  itemId: string
}

const MenuItem = ({ itemId }: MenuItemProp) => {
  const { isActive, activate } = useMenuContext()
  console.log('menuitem')

  const onClickCallback = useCallback(() => {
    activate(itemId)
  }, [activate, itemId])

  return (
    <StyledMenuButton isActive={isActive(itemId)} onClick={onClickCallback}>
      <Icon name={itemId} />
    </StyledMenuButton>
  )
}

export { MenuItem }
