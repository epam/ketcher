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
import Icon from 'components/shared/ui/Icon/Icon'
import { MenuItemVariant } from 'components/menu/menu.types'
import styled from '@emotion/styled'

interface SingleItemPropType {
  key: MenuItemVariant
  name: MenuItemVariant
  onClick: () => void
  activeTool: MenuItemVariant
}

const SingleItemContainer = styled('div')`
  display: flex;
  align-items: center;
  width: 28px;
  height: 28px;
  margin: 4px 0;
  padding: 0;
  justify-content: center;
  border-radius: 2px;
  background-color: ${(props) =>
    props['data-active'] ? 'rgba(0, 131, 143, 0.4)' : 'white'};

  :hover {
    transform: scale(1.2);
  }
`

const SingleItem = ({ name, activeTool, ...props }: SingleItemPropType) => {
  const isActiveTool = activeTool === name

  return (
    <SingleItemContainer data-active={isActiveTool} {...props}>
      <Icon name={name} />
    </SingleItemContainer>
  )
}

export { SingleItem }
