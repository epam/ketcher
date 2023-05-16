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
import { useEffect, useState } from 'react'

export type MonomerItemType = {
  label: string
  colorScheme?: string[]
  monomers?: object
  favorite?: boolean
  props?: any
}

interface MonomerItemProps {
  item: MonomerItemType
  onClick: () => void
  onStarClick?: any
}

const Card = styled.div<{ colorScheme?: string[] }>`
  background: white;
  border-radius: 2px;
  width: 60px;
  height: 48px;
  text-align: center;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: ${({ theme }) => theme.ketcher.font.size.small};
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  margin-right: 18px;
  margin-bottom: 12px;

  &:hover {
    outline: 1px solid #B4B9D6;

    &::after {
      background: ${({ colorScheme, theme }) =>
      (colorScheme && colorScheme[1]) || theme.ketcher.color.monomer.default};;
    }

    > .star {
      visibility: visible;
      opacity: 1;
    }
  }

  &::after {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 8px;
    background: ${({ colorScheme, theme }) =>
    (colorScheme && colorScheme[0]) || theme.ketcher.color.monomer.default};
  }

  > span {
    position: absolute;
    bottom: 6px;
    left: 6px;
  }

  > .star {
    color: #E1E5EA;
    position: absolute;
    top: 12px;
    right: 4px;
    font-size: 15px;
    opacity: 0;
    transition: 0.2s ease;

    &.visible {
      visibility: visible;
      opacity: 1;
    }

    &:active {
      transform: scale(1.4);
    }

    &:hover, &.visible {
      color: #FAA500;
    }
  }
`

const addToFavorites = (event, item) => {
  event.stopPropagation()
  const libString = localStorage.getItem('library') || '[]'
  const lib = JSON.parse(libString)
  const existingItemIndex = lib.findIndex(l => l.props.Name === item.props.Name)
  if (existingItemIndex > -1) {
    lib.splice(existingItemIndex, 1)
    item.favorite = false
  } else {
    lib.push(item)
    item.favorite = true
  }
  localStorage.setItem('library', JSON.stringify(lib))
}

const MonomerItem = (props: MonomerItemProps) => {
  const { item, onClick, onStarClick } = props
  const { favorite } = item
  const [showFavorite, setShowFavorite]: [any, any] = useState(false)

  useEffect(() => {
    setShowFavorite(favorite)
  }, [])

  return (
    <Card onClick={onClick} colorScheme={item.colorScheme}>
      <span>{item.label}</span>
      <div
        onClick={(event) => {
          addToFavorites(event, item)
          setShowFavorite(!!item.favorite)
          if (onStarClick) {
            onStarClick(item)
          }
        }}
        className={'star' + (showFavorite ? ' visible': '')}>
          ★
      </div>
    </Card>
  )
}

export { MonomerItem }
