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
import { type IconName } from 'ketcher-react';
import { useMenuContext } from '../../../hooks/useMenuContext';
import { useCallback } from 'react';
import styled from '@emotion/styled';
import { StyledIconButton } from './styles';
import { blurActiveElement } from 'helpers/canvas';
import { Button } from '@mui/material';

type MenuItemProp = {
  itemId: IconName;
  title?: string;
  testId?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'icon-button' | 'button';
};
const MenuButton = styled(Button)`
  display: flex;
  justify-content: space-between;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  padding: 7px 8px;
  text-transform: none;
  color: #333333;
  width: max-content;
`;

const MenuItem = ({
  itemId,
  title = '',
  disabled,
  testId,
  onClick,
  type = 'icon-button',
}: MenuItemProp) => {
  const { isActive, activate } = useMenuContext();

  const onClickCallback = useCallback(() => {
    activate(itemId);
    blurActiveElement();

    if (onClick) {
      onClick();
    }
  }, [activate, itemId]);

  const isActiveItem = isActive(itemId);
  const activeClass = isActiveItem ? ' active' : '';

  return (
    <>
      {type === 'icon-button' ? (
        <StyledIconButton
          title={title}
          className={itemId + activeClass}
          isActive={isActiveItem}
          onClick={onClickCallback}
          iconName={itemId}
          testId={testId}
          disabled={disabled}
        />
      ) : (
        <MenuButton title={title} onClick={onClickCallback} disabled={disabled}>
          {title}
        </MenuButton>
      )}
    </>
  );
};

export { MenuItem };
