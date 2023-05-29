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
import { MonomerItem, MonomerItemType } from '../monomerLibraryItem'
import styled from '@emotion/styled'

interface MonomerGroupProps {
  items: MonomerItemType[]
  onItemClick: (item: MonomerItemType) => void
  title?: string
}

const ItemsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  flex-flow: row wrap;
  gap: 8px;
  flex: 1;
  justify-content: space-between;
  margin-bottom: 24px;

  &::after {
    content: '';
    flex: auto;
  }
`

const GroupContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  font-size: ${({ theme }) => theme.ketcher.font.size.small};
  font-family: ${({ theme }) => theme.ketcher.font.family.roboto};
  color: ${({ theme }) => theme.ketcher.color.divider};
  margin: 0;
  gap: 8px;
`

const GroupTitle = styled.div`
  height: 100%;
  display: flex;
  flex-grow: 0;
  flex-basis: 14px;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: flex-start;
  font-size: ${({ theme }) => theme.ketcher.font.size.medium};
  font-family: ${({ theme }) => theme.ketcher.font.family.roboto};
  color: ${({ theme }) => theme.ketcher.color.text.primary};
  margin: 0;
`

const MonomerGroup = (props: MonomerGroupProps) => {
  const { items, title, onItemClick } = props

  return (
    <GroupContainer>
      {title && (
        <GroupTitle>
          <span>{title}</span>
        </GroupTitle>
      )}
      <ItemsContainer>
        {items.map((monomer) => {
          const key = monomer.props
            ? `${monomer.props.MonomerName + monomer.props.Name}`
            : monomer.label
          return (
            <MonomerItem
              key={key}
              item={monomer}
              onClick={() => onItemClick(monomer)}
            />
          )
        })}
      </ItemsContainer>
    </GroupContainer>
  )
}
export { MonomerGroup }
