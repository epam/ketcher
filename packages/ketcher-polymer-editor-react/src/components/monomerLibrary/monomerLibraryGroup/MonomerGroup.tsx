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
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin: 0 15px;

  & > * {
    margin: 4px 2px;
  }
`

const Divider = styled.div`
  display: block;
  height: 5px;
  width: 10px;
  border-bottom: 1px solid;
  border-color: ${({ theme }) => theme.ketcher.color.divider};
`

const GroupTitle = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: flex-start;
  font-size: ${({ theme }) => theme.ketcher.font.size.small};
  font-family: ${({ theme }) => theme.ketcher.font.family.roboto};
  color: ${({ theme }) => theme.ketcher.color.divider};
  margin: 4px 4px 0;
`

const MonomerGroup = (props: MonomerGroupProps) => {
  const { items, title, onItemClick } = props

  return (
    <>
      {title && (
        <GroupTitle>
          <span>{title}</span>
          <Divider />
        </GroupTitle>
      )}
      <ItemsContainer>
        {items.map((monomer, key) => {
          return (
            <MonomerItem
              key={key}
              item={monomer}
              onClick={() => onItemClick(monomer)}
            />
          )
        })}
      </ItemsContainer>
    </>
  )
}
export { MonomerGroup }
