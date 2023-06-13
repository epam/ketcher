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
import { EmptyFunction } from 'helpers'
import { debounce } from 'lodash'
import { useMemo, useRef } from 'react'
import { MonomerItem } from '../monomerLibraryItem'
import { MonomerItemType } from '../monomerLibraryItem/types'
import {
  GroupContainer,
  GroupTitle,
  ItemsContainer,
  StyledPreview
} from './styles'
import { IMonomerGroupProps } from './types'
import { usePreview } from './usePreview'

const MonomerGroup = ({
  items,
  title,
  onItemClick = EmptyFunction
}: IMonomerGroupProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [previewItem, previewStyle, setPreviewItem] = usePreview(ref)

  const debouncedSetPreviewItem = useMemo(
    () => debounce(setPreviewItem, 500),
    [setPreviewItem]
  )

  const handleItemMouseLeave = () => {
    debouncedSetPreviewItem.cancel()
    setPreviewItem()
  }

  const handleItemMouseMove = (
    monomer: MonomerItemType,
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (previewItem) {
      setPreviewItem()
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    debouncedSetPreviewItem(monomer, rect)
  }

  console.log(previewItem)

  return (
    <GroupContainer ref={ref}>
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
              onMouseLeave={handleItemMouseLeave}
              onMouseMove={(e) => handleItemMouseMove(monomer, e)}
              onClick={() => onItemClick(monomer)}
            />
          )
        })}
      </ItemsContainer>
      {previewItem && (
        <StyledPreview monomer={previewItem} top={previewStyle?.top || ''} />
      )}
    </GroupContainer>
  )
}
export { MonomerGroup }
