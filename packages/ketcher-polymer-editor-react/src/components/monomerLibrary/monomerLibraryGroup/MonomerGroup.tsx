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
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: normal;
`

const GroupTitle = styled.div`
  flex: 0 0 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: flex-start;
  font-size: ${({ theme }) => theme.ketcher.font.size.medium};
  font-family: ${({ theme }) => theme.ketcher.font.family.roboto};
  color: ${({ theme }) => theme.ketcher.color.text};
  margin-right: 8px;
  width: 8px;
`

const MonomerGroup = (props: MonomerGroupProps) => {
  const { items, title, onItemClick } = props

  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        margin: '0 12px 12px'
      }}>
        {title && (
          <GroupTitle>
            <span>{title}</span>
          </GroupTitle>
        )}
        <ItemsContainer>
          {items.map((monomer) => {
            const key = monomer.props ? `${monomer.props.MonomerName + monomer.props.Name}` : monomer.label
            return (
              <MonomerItem
                key={key}
                item={monomer}
                onClick={() => onItemClick(monomer)}
              />
            )
          })}
        </ItemsContainer>
      </div>
    </>
  )
}
export { MonomerGroup }
